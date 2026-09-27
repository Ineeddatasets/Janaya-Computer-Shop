/**
 * Storefront copy, kept out of the components so the wording can be edited
 * without touching layout.
 */

export const steps = [
  {
    n: '1',
    title: 'Tell us the work',
    body: 'Editing, gaming, a shop counter, a classroom. What the machine is for decides everything else.',
  },
  {
    n: '2',
    title: 'We spec the build',
    body: 'Parts chosen against that job and your budget, with the trade-offs explained in plain terms.',
  },
  {
    n: '3',
    title: 'Collect and go',
    body: 'Assembled, tested overnight, your files moved across. You leave with it already working.',
  },
]

/** The interactive rail. `category` ties a row back to the live catalogue. */
export const range = [
  {
    key: 'Laptops',
    category: 'Laptops',
    title: 'Laptops that survive the commute',
    body: 'Thin machines for coursework and travel, and gaming chassis with the cooling to hold their clocks. Every unit is opened, updated and tested before it leaves.',
  },
  {
    key: 'Desktops',
    category: 'Desktops',
    title: 'Desktops built here, not boxed elsewhere',
    body: 'Our office and gamer builds are assembled on site, cable managed, and burned in for twelve hours. Upgradeable, because the case has room to grow.',
  },
  {
    key: 'Components',
    category: 'Components',
    title: 'Parts, with someone to ask',
    body: 'Processors, boards, memory and graphics from stock you can see. Bring your build list and we will tell you honestly what is worth the money.',
  },
  {
    key: 'Peripherals',
    category: 'Peripherals',
    title: 'The things you actually touch',
    body: 'Monitors, keyboards, mice and printers on the shelf to try. A screen is easier to choose when you are standing in front of it.',
  },
  {
    key: 'Storage',
    category: 'Storage',
    title: 'Room for the work, and a copy of it',
    body: 'Drives for speed and drives for keeping. We will clone your old disk across the counter while you wait.',
  },
  {
    key: 'Networking',
    category: 'Networking',
    title: 'Signal in every room',
    body: 'Routers, switches and cabling for homes, cafes and small offices, sized to the floor plan rather than the box art.',
  },
  {
    key: 'Accessories',
    category: 'Accessories',
    title: 'The parts nobody budgets for',
    body: 'Power backup, bags, hubs and cables. Unglamorous, and the reason a good machine keeps working.',
  },
]

export const stats = [
  { value: 11, suffix: '', label: 'years', note: 'on the same street in Malolos' },
  { value: 4200, suffix: '+', label: 'machines', note: 'built, repaired and handed back' },
  { value: 24, suffix: ' h', label: 'burn-in', note: 'on every desktop we assemble' },
  { value: 4.9, decimals: 1, suffix: '', label: 'out of 5', note: 'across 300+ customer reviews' },
]

export const compare = {
  columns: ['Janaya', 'Big-box retail', 'Online marketplace'],
  rows: [
    { label: 'Someone who asks what the machine is for', values: [true, false, false] },
    { label: 'Built and tested before you collect it', values: [true, false, false] },
    { label: 'Warranty handled in the shop', values: [true, 'Sent away', 'Ship it back'] },
    { label: 'Files moved across for you', values: [true, false, false] },
    { label: 'Same-day repair on common faults', values: [true, false, false] },
    { label: 'You can hold it before you buy', values: [true, true, false] },
    { label: 'Upgrade path explained up front', values: [true, false, false] },
  ],
  footer: { label: 'Setup and data transfer', values: ['Included', '₱1,500', 'Not offered'] },
}

export const reviews = [
  {
    quote:
      'They talked me out of the expensive one. It has been three years and the machine still does everything I need.',
    name: 'Joel R.',
    role: 'Architecture student',
  },
  {
    quote:
      'Six machines for the cafe, delivered and networked in a day. They labelled every cable without being asked.',
    name: 'NetHive Internet Cafe',
    role: 'Pulilan',
  },
  {
    quote:
      'My drive failed on a Friday. They recovered the files and had me working again on Saturday morning.',
    name: 'Karen B.',
    role: 'Freelance editor',
  },
]

export const faqs = [
  {
    q: 'Can you build to a budget I set?',
    a: 'Yes. Tell us the number and what the machine is for, and we will show you where the money is best spent and where it is wasted. You see the parts list before anything is ordered.',
  },
  {
    q: 'Do you service machines you did not sell?',
    a: 'We do. Diagnosis is free, and we will tell you when a repair is not worth it rather than quietly charging you for one.',
  },
  {
    q: 'What warranty comes with a Janaya build?',
    a: 'One year on labour and the assembly itself, with the manufacturer warranty on each part carried on top. Claims are handled here at the counter, not posted away by you.',
  },
  {
    q: 'How long does a custom desktop take?',
    a: 'Usually two working days when the parts are in stock. That includes a twelve hour burn-in, because faults show up under load rather than on the bench.',
  },
  {
    q: 'Can you move my files from an old computer?',
    a: 'Yes, and it is included. Bring the old machine or just its drive and we will transfer your files, browser profiles and installed licences across.',
  },
  {
    q: 'Do you supply schools and offices?',
    a: 'Regularly. We quote per unit, deliver, network and label everything, and keep a record of what each site runs so replacements match.',
  },
]

export const brands = [
  'ACER',
  'ASUS',
  'LENOVO',
  'AMD',
  'MSI',
  'KINGSTON',
  'SAMSUNG',
  'SEAGATE',
  'LOGITECH',
  'EPSON',
  'TP-LINK',
  'SEASONIC',
  'REDRAGON',
  'APC',
]
