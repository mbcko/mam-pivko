// data.jsx — mock data + global app state (no backend).
// Exposes: window.useAppState, window.MONTHS_CZ, window.fmtCzechDate, window.daysUntil

const MONTHS_CZ = [
  'ledna', 'února', 'března', 'dubna', 'května', 'června',
  'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
];
const MONTHS_CZ_SHORT = [
  'LED', 'ÚNO', 'BŘE', 'DUB', 'KVĚ', 'ČVN',
  'ČVC', 'SRP', 'ZÁŘ', 'ŘÍJ', 'LIS', 'PRO'
];
const DAYS_CZ = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];

function parseDate(s) {
  // s is YYYY-MM-DD
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function fmtCzechDate(s, opts = {}) {
  const d = parseDate(s);
  const day = d.getDate();
  const month = MONTHS_CZ[d.getMonth()];
  const year = d.getFullYear();
  const weekday = DAYS_CZ[d.getDay()];
  if (opts.weekday) return `${weekday} ${day}. ${month} ${year}`;
  return `${day}. ${month} ${year}`;
}
function daysUntil(s) {
  const d = parseDate(s);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d - now) / (1000 * 60 * 60 * 24));
}
function isFuture(s) {
  return daysUntil(s) > 0;
}
function isToday(s) {
  return daysUntil(s) === 0;
}

// ====== MOCK DATA ======
// 6 organizers in rotation
const ORGANIZERS = ['MaSaK', 'schunka', 'mbcko', 'Honza', 'Petra', 'Vašek'];

const WISHLIST_INITIAL = [
  {
    id: 'w1', name: 'Pult', address: 'V celnici 1031/4, Praha 1 - Nové Město',
    note: 'Cocktailový raj, ale i pivo dobrý', url: '',
    coords: { lat: 50.087, lng: 14.43 }, mapyLabel: 'Pult – V celnici 1031/4',
    visits: 0
  },
  {
    id: 'w2', name: 'Restaurace Darwin', address: 'Zbraslav',
    note: 'Daleko, ale stojí to za to', url: '',
    coords: { lat: 49.97, lng: 14.39 }, mapyLabel: 'Restaurace Darwin – Zbraslav',
    visits: 0
  },
  {
    id: 'w3', name: 'Restaurace Bernard BREWHOUSE', address: 'Perunova 804/17, Praha 3 - Vinohrady',
    note: '', url: 'https://bernard.cz',
    coords: { lat: 50.078, lng: 14.46 }, mapyLabel: 'Bernard – Perunova 804/17',
    visits: 1
  },
  {
    id: 'w4', name: 'Vinohradský pivovar', address: 'Korunní 2506/106, Praha 10 - Vinohrady',
    note: 'Domácí pivo, dobrý ležák', url: '',
    coords: { lat: 50.077, lng: 14.464 }, mapyLabel: 'Vinohradský pivovar',
    visits: 2
  },
  {
    id: 'w5', name: 'U Sadu', address: 'Praha 3 - Žižkov',
    note: 'Klasika', url: '',
    coords: null, // no map data
    mapyLabel: '',
    visits: 0
  },
];

const EVENTS_INITIAL = [
  // Future events
  {
    id: 'e1',
    name: '',
    date: '2026-06-25',
    organizer: 'MaSaK',
    notes: 'Tentokrát Karlín? Sejdeme se v 18:30.',
    pubs: []
  },
  {
    id: 'e2',
    name: '',
    date: '2026-08-14',
    organizer: 'Honza',
    notes: '',
    pubs: [
      { id: 'p1', name: 'Lokál Hamburk', address: 'Sokolovská 55, Karlín', note: '', url: 'https://lokal-hamburk.ambi.cz/', mapyLabel: 'Lokál Hamburk' },
      { id: 'p2', name: 'BeerGeek Bar', address: 'Vinohradská 62, Vinohrady', note: 'Craft', url: '', mapyLabel: 'BeerGeek Bar' },
    ]
  },
  // Past — most recent first
  {
    id: 'e3',
    name: '',
    date: '2026-04-24',
    organizer: 'schunka',
    notes: 'Vršovice tour, klasika. Sraz u Sladkovskýho.',
    pubs: [
      { id: 'p1', name: 'Café Sladkovský', address: 'Sevastopolská 48/17, Praha 10 - Vršovice', note: 'Tady bychom mohli dat jidlo', url: 'http://cafesladkovsky.cz/menu-cz/', mapyLabel: 'Café Sladkovský – Sevastopolská 48/17' },
      { id: 'p2', name: 'Bohemia Boards & Brews', address: 'Charkovská 441/18, Praha 10 - Vršovice', note: '', url: '', mapyLabel: 'Bohemia Boards & Brews' },
      { id: 'p3', name: 'Galerie Piva', address: 'Krymská 138/36, Praha 10 - Vršovice', note: 'Tap room s rotující nabídkou', url: '', mapyLabel: 'Galerie Piva – Krymská 138/36' },
      { id: 'p4', name: '3J Beer Bar', address: 'Ruská 557/30, Praha 10 - Vršovice', note: '', url: '', mapyLabel: '3J Beer Bar – Ruská 557/30' },
      { id: 'p5', name: 'Pivní zastávka', address: '28. pluku 483/11, Praha 10 - Vršovice', note: '', url: '', mapyLabel: 'Pivní zastávka – 28. pluku 483/11' },
      { id: 'p6', name: 'To si vypiješ', address: 'Minská 1002/1, Praha 10 - Vršovice', note: '', url: '', mapyLabel: 'To si vypiješ – Minská 1002/1' },
    ]
  },
  {
    id: 'e4',
    name: '',
    date: '2026-02-27',
    organizer: 'mbcko',
    notes: '',
    pubs: [
      { id: 'p1', name: 'U Vystřelenýho oka', address: 'U Božích bojovníků 3, Praha 3 - Žižkov', note: 'Lidovka', url: '', mapyLabel: 'U Vystřelenýho oka' },
      { id: 'p2', name: 'Hostinec U Sadu', address: 'Škroupovo nám. 5, Praha 3 - Žižkov', note: '', url: '', mapyLabel: 'U Sadu' },
      { id: 'p3', name: 'Riegrovy sady — letní scéna', address: 'Riegrovy sady, Praha 2', note: 'Když je teplo', url: '', mapyLabel: 'Riegrovy sady' },
      { id: 'p4', name: 'Bukowski\'s Bar', address: 'Bořivojova 86, Praha 3 - Žižkov', note: 'Pozdější etapa', url: '', mapyLabel: 'Bukowski\'s' },
      { id: 'p5', name: 'Hospůdka na Hradbách', address: 'V Pevnosti 159/2, Praha 2 - Vyšehrad', note: '', url: '', mapyLabel: 'Na Hradbách' },
      { id: 'p6', name: 'Café V lese', address: 'Krymská 12, Praha 10 - Vršovice', note: 'Hudba pozdě v noci', url: '', mapyLabel: 'Café V lese' },
    ]
  },
  {
    id: 'e5',
    name: '',
    date: '2026-01-09',
    organizer: 'MaSaK',
    notes: 'Nový rok, nový pivo. Trochu kratší trasa.',
    pubs: [
      { id: 'p1', name: 'Lokál Dlouhááá', address: 'Dlouhá 33, Praha 1', note: '', url: 'https://lokal-dlouha.ambi.cz', mapyLabel: 'Lokál Dlouhá' },
      { id: 'p2', name: 'U Černého vola', address: 'Loretánské nám. 1, Praha 1', note: 'Bez WiFi naschvál', url: '', mapyLabel: 'U Černého vola' },
      { id: 'p3', name: 'Pivovarský klub', address: 'Křižíkova 17, Praha 8', note: '', url: '', mapyLabel: 'Pivovarský klub' },
      { id: 'p4', name: 'BeerGeek Bar', address: 'Vinohradská 62, Praha 2', note: '', url: '', mapyLabel: 'BeerGeek Bar' },
      { id: 'p5', name: 'Kulový blesk', address: 'Sokolská 13, Praha 2', note: 'Závěr', url: '', mapyLabel: 'Kulový blesk' },
    ]
  },
  {
    id: 'e6',
    name: '',
    date: '2025-11-21',
    organizer: 'schunka',
    notes: '',
    pubs: [
      { id: 'p1', name: 'Pivnice U Pivrnce', address: 'Maiselova 3, Praha 1', note: '', url: '', mapyLabel: 'U Pivrnce' },
      { id: 'p2', name: 'U Medvídků', address: 'Na Perštýně 7, Praha 1', note: 'X-Beer 33', url: '', mapyLabel: 'U Medvídků' },
      { id: 'p3', name: 'Pivovarský dům', address: 'Lípová 15, Praha 2', note: 'Banánové pivo', url: '', mapyLabel: 'Pivovarský dům' },
      { id: 'p4', name: 'Zlý časy', address: 'Čestmírova 5, Praha 4 - Nusle', note: 'Hodně piv na čepu', url: '', mapyLabel: 'Zlý časy' },
      { id: 'p5', name: 'Kantýna', address: 'Politických vězňů 5, Praha 1', note: 'Pozdní jídlo', url: '', mapyLabel: 'Kantýna' },
      { id: 'p6', name: 'Hostinec U Stočesů', address: 'Trojická 1, Praha 2', note: '', url: '', mapyLabel: 'U Stočesů' },
    ]
  },
  {
    id: 'e7',
    name: '',
    date: '2025-10-31',
    organizer: 'mbcko',
    notes: 'Halloween edition. Náhradní masky na místě.',
    pubs: [
      { id: 'p1', name: 'Kavárna Liberál', address: 'Heřmanova 6, Praha 7 - Holešovice', note: '', url: '', mapyLabel: 'Liberál' },
      { id: 'p2', name: 'Vzorkovna (Dog Bar)', address: 'Národní 11, Praha 1', note: 'Pes na místě, nelekat se', url: '', mapyLabel: 'Vzorkovna' },
      { id: 'p3', name: 'Cross Club', address: 'Plynární 23, Praha 7', note: 'Pokud chceme tancovat', url: '', mapyLabel: 'Cross Club' },
      { id: 'p4', name: 'Bukowski\'s Bar', address: 'Bořivojova 86, Praha 3', note: '', url: '', mapyLabel: 'Bukowski\'s' },
      { id: 'p5', name: 'U Sudu', address: 'Vodičkova 10, Praha 1', note: 'Sklepy', url: '', mapyLabel: 'U Sudu' },
      { id: 'p6', name: 'Hostinec U Krále Brabantského', address: 'Thunovská 15, Praha 1', note: 'Nejstarší v Praze', url: '', mapyLabel: 'U Krále Brabantského' },
    ]
  },
];

// ====== STATE HOOK ======
function useAppState() {
  // We use a single React-controlled store for the prototype.
  const [events, setEvents] = React.useState(() => {
    try {
      const saved = localStorage.getItem('mam-pivko-events');
      if (saved) return JSON.parse(saved);
    } catch {}
    return EVENTS_INITIAL;
  });
  const [wishlist, setWishlist] = React.useState(() => {
    try {
      const saved = localStorage.getItem('mam-pivko-wishlist');
      if (saved) return JSON.parse(saved);
    } catch {}
    return WISHLIST_INITIAL;
  });
  const [auth, setAuth] = React.useState(() => {
    try {
      const saved = localStorage.getItem('mam-pivko-auth');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { loggedIn: true, name: 'mbcko', email: 'mbcko@heureka.cz' };
  });

  React.useEffect(() => {
    try { localStorage.setItem('mam-pivko-events', JSON.stringify(events)); } catch {}
  }, [events]);
  React.useEffect(() => {
    try { localStorage.setItem('mam-pivko-wishlist', JSON.stringify(wishlist)); } catch {}
  }, [wishlist]);
  React.useEffect(() => {
    try { localStorage.setItem('mam-pivko-auth', JSON.stringify(auth)); } catch {}
  }, [auth]);

  return {
    events, setEvents,
    wishlist, setWishlist,
    auth, setAuth,
    ORGANIZERS,
    resetAll: () => {
      setEvents(EVENTS_INITIAL);
      setWishlist(WISHLIST_INITIAL);
    }
  };
}

// ====== Title helper ======
function eventTitle(ev) {
  if (ev.name) return ev.name;
  return `MAM Pivko — ${ev.organizer}`;
}

// ====== UID ======
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

Object.assign(window, {
  useAppState, MONTHS_CZ, MONTHS_CZ_SHORT, DAYS_CZ,
  fmtCzechDate, daysUntil, isFuture, isToday, parseDate,
  eventTitle, uid
});
