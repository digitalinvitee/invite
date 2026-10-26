/* Waits for faces that are drawn into canvases (the CRT), with a timeout so nothing ever blocks. */
export function waitForFonts(specs, timeout = 1200) {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  const loads = Promise.all(specs.map((spec) => document.fonts.load(spec).catch(() => null)));
  return Promise.race([loads, new Promise((r) => setTimeout(r, timeout))]);
}

export const CRT_FONTS = ['800 100px Archivo', '40px VT323', 'italic 400 100px "Bodoni Moda"'];
