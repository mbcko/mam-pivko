// shell.jsx — shared layout & primitives
// Exposes: Appbar, BackLink, Icon, MapPlaceholder, Modal, Avatar, OrganizerChip, GoogleIcon

function Icon({ name, size = 18, ...rest }) {
  const s = size;
  const props = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...rest };
  switch (name) {
    case 'plus':       return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'pencil':     return <svg {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>;
    case 'trash':      return <svg {...props}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>;
    case 'x':          return <svg {...props}><path d="M18 6 6 18M6 6l12 12"/></svg>;
    case 'check':      return <svg {...props}><path d="M20 6 9 17l-5-5"/></svg>;
    case 'arrow-left': return <svg {...props}><path d="m15 18-6-6 6-6"/></svg>;
    case 'arrow-right':return <svg {...props}><path d="m9 18 6-6-6-6"/></svg>;
    case 'star':       return <svg {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    case 'star-fill':  return <svg {...props} fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    case 'pin':        return <svg {...props}><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
    case 'calendar':   return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case 'external':   return <svg {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
    case 'link':       return <svg {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
    case 'logout':     return <svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
    case 'menu':       return <svg {...props}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
    case 'drag':       return <svg {...props} viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>;
    case 'search':     return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
    case 'beer':       return <svg {...props}><path d="M17 11h1a3 3 0 0 1 0 6h-1"/><path d="M9 12v6"/><path d="M13 12v6"/><path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5C9.44 3.5 10 3 11 3s1.56.5 3 .5c.83 0 1.5-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z"/></svg>;
    default: return null;
  }
}

function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.5 12.27c0-.78-.07-1.53-.2-2.27H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.22-4.74 3.22-8.31Z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84Z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.65l3.15-3.15C17.46 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"/>
    </svg>
  );
}

function Appbar({ auth, onLogin, onLogout, route, onRoute, wishlistCount }) {
  return (
    <header className="appbar">
      <div className="appbar-inner">
        <a className="brand" href="#/" onClick={(e) => { e.preventDefault(); onRoute('/'); }}>
          <span className="mug" aria-hidden>🍺</span>
          <span>mam&nbsp;pivko<span className="bang">!</span></span>
        </a>
        <div className="appbar-actions">
          <a
            className="btn btn-sm btn-secondary"
            href="#/wishlist"
            onClick={(e) => { e.preventDefault(); onRoute('/wishlist'); }}
            title="Wishlist hospod"
          >
            <Icon name="star" size={14} />
            <span className="hide-mobile">Wishlist</span>
            <span className="muted" style={{ fontWeight: 600 }}>({wishlistCount})</span>
          </a>
          {auth.loggedIn ? (
            <React.Fragment>
              {route !== '/new' && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => onRoute('/new')}
                  title="Nová akce"
                >
                  <Icon name="plus" size={14} />
                  <span className="hide-mobile">Nová akce</span>
                </button>
              )}
              <Avatar name={auth.name} />
              <button
                className="icon-btn"
                onClick={onLogout}
                title="Odhlásit"
                aria-label="Odhlásit"
                style={{ width: 32, height: 32 }}
              >
                <Icon name="logout" size={15} />
              </button>
            </React.Fragment>
          ) : (
            <button className="btn btn-sm btn-ghost" onClick={onLogin}>
              <GoogleIcon size={14} />
              <span className="hide-mobile">Přihlásit</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function Avatar({ name, size = 32 }) {
  const letter = (name || '?').charAt(0).toUpperCase();
  // hash name to color
  const colors = [
    ['#fff4dc', '#a35a00'],
    ['#ebfaff', '#0054a3'],
    ['#ebfffa', '#006657'],
    ['#fff4e3', '#a35a00'],
    ['#ffebf0', '#a30b00'],
    ['#fffbeb', '#a38300'],
  ];
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  const [bg, fg] = colors[h % colors.length];
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 999,
        background: bg, color: fg,
        display: 'grid', placeItems: 'center',
        fontWeight: 800, fontSize: size * 0.42,
        border: '1.5px solid rgba(0,0,0,0.06)',
      }}
      title={name}
    >
      {letter}
    </div>
  );
}

function OrganizerChip({ name }) {
  return (
    <span className="chip" style={{ display: 'inline-flex', gap: 5, paddingLeft: 4 }}>
      <Avatar name={name} size={18} />
      <span style={{ paddingRight: 4 }}>{name}</span>
    </span>
  );
}

function BackLink({ onClick, label = 'Zpět' }) {
  return (
    <button className="back-link" onClick={onClick}>
      <Icon name="arrow-left" size={14} />
      {label}
    </button>
  );
}

// MapPlaceholder — a SVG fake "Mapy.cz" map with pins.
// We don't have an external map; we render a stylized 2D map with district shapes
// + numbered red pins. Deterministic from `pins` array (each {label, x, y} in 0..1 box).
function MapPlaceholder({ pins, size = 'compact' }) {
  // generate pin layout if pins lack x/y
  const placed = React.useMemo(() => {
    const n = pins.length;
    if (n === 0) return [];
    return pins.map((p, i) => {
      if (typeof p.x === 'number' && typeof p.y === 'number') return p;
      // arrange pins in a wandering loop
      const t = (i + 1) / (n + 1);
      const rand = (k) => {
        let s = 0;
        const str = (p.label || '') + i + k;
        for (let j = 0; j < str.length; j++) s = (s * 33 + str.charCodeAt(j)) & 0xff;
        return s / 255;
      };
      return {
        ...p,
        x: 0.18 + t * 0.64 + (rand(1) - 0.5) * 0.12,
        y: 0.30 + Math.sin(t * 5 + rand(2) * 2) * 0.22 + (rand(3) - 0.5) * 0.10,
      };
    });
  }, [pins]);

  return (
    <div className={`map-wrap ${size}`}>
      <svg className="map-svg" viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#dbe0d0" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="800" height="360" fill="#f1ede0"/>
        <rect width="800" height="360" fill="url(#grid)"/>
        {/* Vltava river */}
        <path d="M -40 80 Q 200 120, 320 200 T 600 280 Q 700 320, 860 300 L 860 360 L -40 360 Z" fill="#bcd6e8" opacity="0.7"/>
        <path d="M -40 80 Q 200 120, 320 200 T 600 280 Q 700 320, 860 300" fill="none" stroke="#8fb4ce" strokeWidth="1" opacity="0.8"/>
        {/* Parks */}
        <ellipse cx="600" cy="100" rx="120" ry="45" fill="#cfdfba" opacity="0.7"/>
        <ellipse cx="160" cy="270" rx="110" ry="50" fill="#cfdfba" opacity="0.6"/>
        {/* Roads (subtle yellow) */}
        <path d="M 0 180 Q 250 160, 400 220 T 800 200" stroke="#f0c75a" strokeWidth="6" fill="none" opacity="0.7"/>
        <path d="M 0 180 Q 250 160, 400 220 T 800 200" stroke="#fff" strokeWidth="1" fill="none" strokeDasharray="6 6" opacity="0.6"/>
        <path d="M 200 0 L 280 360" stroke="#e0d2a6" strokeWidth="3" fill="none" opacity="0.6"/>
        <path d="M 500 0 L 480 360" stroke="#e0d2a6" strokeWidth="3" fill="none" opacity="0.6"/>
        {/* District labels */}
        <text x="120" y="60" fontFamily="serif" fontSize="13" fill="#7a7a6e" fontWeight="700" opacity="0.7">Holešovice</text>
        <text x="500" y="80" fontFamily="serif" fontSize="13" fill="#7a7a6e" fontWeight="700" opacity="0.7">Vinohrady</text>
        <text x="380" y="320" fontFamily="serif" fontSize="13" fill="#7a7a6e" fontWeight="700" opacity="0.7">Vršovice</text>
        <text x="60" y="200" fontFamily="serif" fontSize="13" fill="#7a7a6e" fontWeight="700" opacity="0.6">Smíchov</text>

        {/* Route lines connecting pins */}
        {placed.length > 1 && (
          <polyline
            points={placed.map((p) => `${p.x * 800},${p.y * 360}`).join(' ')}
            stroke="#dc0032"
            strokeWidth="2"
            strokeDasharray="5 4"
            fill="none"
            opacity="0.55"
          />
        )}

        {/* Pins */}
        {placed.map((p, i) => {
          const cx = p.x * 800, cy = p.y * 360;
          return (
            <g key={i} transform={`translate(${cx} ${cy})`}>
              <path d="M 0 0 L -10 -16 Q -10 -28 0 -28 Q 10 -28 10 -16 Z" fill="#dc0032" stroke="white" strokeWidth="1.5"/>
              <text x="0" y="-15" fontSize="11" fontWeight="700" fill="white" textAnchor="middle" dominantBaseline="middle" fontFamily="sans-serif">{i + 1}</text>
            </g>
          );
        })}
      </svg>
      <div className="map-logo">MAPY.com</div>
      <div className="credit">© Seznam.cz a.s. a další</div>
    </div>
  );
}

function Modal({ children, onClose }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, GoogleIcon, Appbar, Avatar, OrganizerChip, BackLink, MapPlaceholder, Modal
});
