/* English UI strings used by scripts. Page copy lives in the HTML so it is indexable and fast.
   To add Georgian: copy this file to ka.js, translate the values, and register it in index.js. */

export default {
  sound: { on: 'Sound on', off: 'Sound off' },

  intro: {
    status: 'A broken television tunes in and shows the name INVITÉ.',
    noSignal: 'NO SIGNAL',
    searching: 'SEARCHING',
    channel: 'CH 01',
    complete: 'TRANSMISSION COMPLETE',
    volume: 'VOLUME'
  },

  journey: [
    { id: 'teaser', when: 'Weeks before', title: 'Teaser', text: 'A coming-soon page and short loops that hint at what is coming. People start asking.' },
    { id: 'reveal', when: 'The reveal', title: 'Reveal', text: 'The name, the product, the date: revealed in motion, in formats for feeds, stories and large screens.' },
    { id: 'invitation', when: 'Invitations out', title: 'Invitation', text: 'A personal invitation for the people who matter most: press, partners and first customers.', more: 'Invitations are service 004' },
    { id: 'rsvp', when: 'Replies in', title: 'RSVP', text: 'Replies, guests and preferences in one place, before anyone arrives.', more: 'Replies are service 004' },
    { id: 'launch', when: 'Launch day and after', title: 'Launch', text: 'The teaser becomes the full site, with everything the launch needs next.' }
  ],

  form: {
    required: 'This field is required.',
    name: 'Please tell us your name.',
    email: 'Please add your email so we can reply.',
    emailFormat: 'This email looks incomplete. Check for a missing @ or domain.',
    category: 'Choose the option closest to your project. "Not Sure Yet" is fine.',
    description: 'Tell us a little more. A few sentences are enough.',
    message: 'Please write a short message.',
    tooFast: 'That was very fast. Please wait a moment and send again.',
    verifyWait: 'The security check is still running. Please send again in a few seconds.',
    verifyFailed: 'The security check could not load, so this message was not sent. Please try again later or reach us by email.',
    sending: 'Sending',
    sendProject: 'Send project brief',
    prepareEmail: 'Prepare my email',
    prepareCopy: 'Prepare my message',
    reviewType: 'Project type',
    reviewProject: 'Project',
    reviewTiming: 'Timing and budget',
    reviewNone: 'Not given',
    reviewEdit: 'Edit',
    sendHello: 'Send message',
    successTitle: 'Received. Thank you, {name}.',
    successText: 'Your message reached the studio. You will get a personal reply at {email}.',
    successAgain: 'Send another message',
    errorTitle: 'Your message did not send.',
    errorTimeout: 'The studio inbox took too long to answer, so we cannot confirm it arrived.',
    errorNetwork: 'We could not reach the studio inbox. Check your connection.',
    errorRejected: 'It was not accepted ({detail}).',
    errorGeneric: 'Something went wrong on the way.',
    errorText: 'Your answers are still here. Please try again in a moment.',
    errorTextEmail: 'Your answers are still here. Try again in a moment, or write to {email}.',
    sendWhatsapp: 'Send it on WhatsApp ↗',
    whatsappLink: 'WhatsApp {number} (opens WhatsApp)',
    setupEmail: 'Online sending is being set up. When you finish, we will prepare an email to {email} with everything you wrote.',
    setupCopy: 'Online sending is not connected yet, so this form cannot send. You can still write your brief here; at the end it is prepared for you to copy, so nothing is lost.',
    notConnectedTitle: 'Online sending is not connected yet, so nothing has been sent.',
    notConnectedText: 'Copy it below so nothing you typed is lost.',
    notConnectedEmail: 'Write to {email}, or copy your message below.',
    copy: 'Copy message',
    copied: 'Copied',
    selectCopy: 'Selected. Press Ctrl+C or ⌘+C to copy.'
  }
};
