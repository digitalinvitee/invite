#!/usr/bin/env node
/*
  Writes the Creative Solutions tiles, their details and their project catalogs into index.html,
  from js/solutions/solutions.js (the services) and js/solutions/projects.js (the projects).
  Run it from the project folder after editing either file:

      node tools/render-solutions.mjs

  It replaces only what sits between the <!-- solutions:mosaic --> markers in index.html (the tiles, details and
  catalogs), between the <!-- solutions:strip --> markers (the four service links under the hero) and between the
  <!-- solutions:invites --> markers (the compact invitations block of Selected Work, from the live projects of 004).
  Before writing anything it checks the project list (known services, no duplicate ids, and that every
  image, screen and case-study page a project points at exists; that each screen has a description and
  each plate colour is a hex colour; that live addresses are https), and stops with a clear message if
  something would produce a broken card, spread or link.
  No dependencies; Node 20 or newer.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = (rel) => import(pathToFileURL(path.join(ROOT, rel)));
const { solutions, isLive } = await load('js/solutions/solutions.js');
const { projects, projectsFor, isShowable } = await load('js/solutions/projects.js');
const { renderMosaic, renderStrip } = await load('js/solutions/render.js');
const { renderCatalog, renderInvites, INVITES_MAX } = await load('js/solutions/catalog.js');

/* ── Check the project list ─────────────────────────────────────────── */
const errors = [], warnings = [];
const serviceIds = new Set(solutions.map((s) => s.id));
const seen = new Set();
const EVENT_TYPES = ['Weddings', 'Corporate', 'Private Celebrations'];   // the groups 004 You're Invited sorts by
const filterField = (s) => (s.filterBy === 'eventType' ? 'eventType' : 'industry');
const onDisk = (rel) => fs.existsSync(path.join(ROOT, rel.split(/[?#]/)[0]));
const pageOnDisk = (rel) => {
  const p = path.join(ROOT, rel.split(/[?#]/)[0]);
  return fs.existsSync(p) && (fs.statSync(p).isDirectory() ? fs.existsSync(path.join(p, 'index.html')) : true);
};

for (const p of projects) {
  const at = `projects.js › ${p.id || p.name || '(unnamed project)'}`;
  if (!p.id) errors.push(`${at}: missing id`);
  else if (seen.has(p.id)) errors.push(`${at}: duplicate id`);
  seen.add(p.id);
  if (!Array.isArray(p.services) || !p.services.length) warnings.push(`${at}: belongs to no service, so it is not shown`);
  for (const sid of p.services || []) if (!serviceIds.has(sid)) errors.push(`${at}: unknown service "${sid}" (use ${[...serviceIds].join(', ')})`);
  for (const sid of p.services || []) {
    const svc = solutions.find((x) => x.id === sid);
    if (svc && !String(p[filterField(svc)] || '').trim()) warnings.push(`${at}: has no ${filterField(svc)}, so it will not appear under a filter of ${sid}`);
  }
  if (p.eventType && !EVENT_TYPES.includes(p.eventType)) warnings.push(`${at}: eventType "${p.eventType}" is not one of ${EVENT_TYPES.join(', ')}; it still works, as a group of its own`);
  if (!isShowable(p)) warnings.push(`${at}: not shown. A card needs a name, coverImage, coverAlt and a status of live, in-development or concept`);
  if (p.coverImage) {
    const files = [p.coverImage, ...String(p.coverSrcset || '').split(',').map((x) => x.trim().split(/\s+/)[0]).filter(Boolean)];
    for (const f of files) if (!onDisk(f)) errors.push(`${at}: image not found: ${f}`);
  }
  if (p.screens !== undefined) {
    if (!Array.isArray(p.screens) || !p.screens.length) errors.push(`${at}: screens must be a list of one to three screens`);
    else {
      if (p.screens.length > 3) warnings.push(`${at}: ${p.screens.length} screens given; only the first 3 are shown`);
      p.screens.forEach((sc, i) => {
        const where = `${at} › screens[${i}]`;
        if (!sc || !sc.image) { errors.push(`${where}: missing image`); return; }
        if (!sc.alt) errors.push(`${where}: missing alt (say what the screen shows, in one sentence)`);
        const files = [sc.image, ...String(sc.srcset || '').split(',').map((x) => x.trim().split(/\s+/)[0]).filter(Boolean)];
        for (const f of files) if (!onDisk(f)) errors.push(`${where}: image not found: ${f}`);
        if (sc.size !== undefined && !(Array.isArray(sc.size) && sc.size.length === 2 && sc.size.every((n) => Number.isFinite(n) && n > 0))) errors.push(`${where}: size must be [width, height]`);
      });
    }
  }
  if (p.previewTone !== undefined && !/^#(?:[0-9a-f]{3}){1,2}$/i.test(String(p.previewTone))) errors.push(`${at}: previewTone must be a hex colour like #1d2918`);
  if (p.caseStudyUrl) {
    if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(p.caseStudyUrl)) errors.push(`${at}: caseStudyUrl must be a page inside this site, not ${p.caseStudyUrl}`);
    else if (!pageOnDisk(p.caseStudyUrl)) errors.push(`${at}: case study page not found: ${p.caseStudyUrl}`);
  }
  if (p.liveUrl && p.status !== 'live') warnings.push(`${at}: liveUrl is set but the status is "${p.status}", so no live link is shown`);
  if (p.liveUrl && !/^https:\/\//i.test(p.liveUrl)) errors.push(`${at}: liveUrl must start with https://`);
}

/* A catalog set as spreads shows each project's real screens, so say so when a project has none (it falls back to its cover). */
for (const s of solutions) {
  if (s.catalogLayout !== undefined && !['cards', 'spread'].includes(s.catalogLayout)) errors.push(`solutions.js › ${s.id}: catalogLayout must be 'cards' or 'spread', not "${s.catalogLayout}"`);
  if (s.catalogLayout === 'spread') {
    for (const p of projectsFor(s.id)) if (!Array.isArray(p.screens) || !p.screens.length) warnings.push(`projects.js › ${p.id}: ${s.id} is set as spreads, but this project has no screens; its cover is shown alone`);
  }
}

/* "Discuss a project like this" preselects a project type in the contact form, so each service's contactCategory must be one of the form's own choices. */
const decode = (text) => text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const formTypes = new Set([...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/<input\b[^>]*\bname="category"[^>]*>/g)]
  .map((m) => (/\bvalue="([^"]*)"/.exec(m[0]) || [])[1]).filter(Boolean).map(decode));
for (const s of solutions) {
  if (s.contactCategory && formTypes.size && !formTypes.has(s.contactCategory)) {
    errors.push(`solutions.js › ${s.id}: contactCategory "${s.contactCategory}" is not one of the contact form's project types (${[...formTypes].join(', ')})`);
  }
}

for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error('\nindex.html was not changed.');
  process.exit(1);
}

/* ── Write index.html ───────────────────────────────────────────────── */
const file = path.join(ROOT, 'index.html');
let html = fs.readFileSync(file, 'utf8');
const re = /(<!-- solutions:mosaic -->)[\s\S]*?(\s*<!-- \/solutions:mosaic -->)/;
if (!re.test(html)) throw new Error('Marker <!-- solutions:mosaic --> not found in index.html');
html = html.replace(re, (_, open, close) => `${open}\n      ${renderMosaic(solutions, renderCatalog)}${close}`);
const reStrip = /(<!-- solutions:strip -->)[\s\S]*?(\s*<!-- \/solutions:strip -->)/;
if (!reStrip.test(html)) throw new Error('Marker <!-- solutions:strip --> not found in index.html');
html = html.replace(reStrip, (_, open, close) => `${open}\n      ${renderStrip(solutions)}${close}`);
const reInvites = /(<!-- solutions:invites -->)[\s\S]*?(\s*<!-- \/solutions:invites -->)/;
if (!reInvites.test(html)) throw new Error('Marker <!-- solutions:invites --> not found in index.html');
const invites = renderInvites(projectsFor('youre-invited'));
html = html.replace(reInvites, (_, open, close) => `${open}\n${invites ? `    ${invites.replace(/\n/g, '\n    ')}` : ''}${close}`);
fs.writeFileSync(file, html);

const liveInvites = projectsFor('youre-invited').filter((p) => p.status === 'live' && /^https:\/\//i.test(String(p.liveUrl || '')));
console.log(`Selected Work: ${invites ? `${Math.min(liveInvites.length, INVITES_MAX)} live invitation${Math.min(liveInvites.length, INVITES_MAX) === 1 ? '' : 's'} shown (of ${projectsFor('youre-invited').length} in the 004 catalog)` : 'no live invitation, so the compact block is left out'}.`);
console.log(`index.html: ${solutions.length} solutions written (${solutions.filter(isLive).length} with a live demonstration link).`);
for (const s of solutions) {
  const n = projectsFor(s.id).length;
  console.log(`  ${s.number} ${s.id}: ${n ? `${n} project${n === 1 ? '' : 's'} in the catalog` : 'no projects yet (the panel shows its empty note and “Start a project”)'}`);
}
