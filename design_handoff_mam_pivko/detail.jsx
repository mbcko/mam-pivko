// detail.jsx — Event detail screen
// Exposes: window.DetailScreen

function PubCard({ pub, num, style }) {
  const head = (
    <div className="head-row" style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <h4 style={{ marginRight: 'auto' }}>{pub.name || <span className="muted" style={{ fontWeight: 400 }}>Bez jména</span>}</h4>
    </div>
  );
  return (
    <div className="pub-card">
      {head}
      {pub.address && <div className="addr">{pub.address}</div>}
      {pub.note && <div className="note">"{pub.note}"</div>}
      <div className="links">
        {pub.url && (
          <a href={pub.url} target="_blank" rel="noreferrer">
            <window.Icon name="link" size={14} /> Otevřít odkaz
          </a>
        )}
        {pub.mapyLabel && (
          <a
            href={`https://mapy.cz/zakladni?q=${encodeURIComponent(pub.mapyLabel)}`}
            target="_blank"
            rel="noreferrer"
          >
            <window.Icon name="pin" size={14} /> Mapy.cz
          </a>
        )}
      </div>
    </div>
  );
}

function RouteTimeline({ pubs }) {
  return (
    <div className="route style-timeline">
      {pubs.map((p, i) => (
        <div key={p.id || i} className="route-stop">
          <div className="num">{i + 1}</div>
          <PubCard pub={p} num={i + 1} />
        </div>
      ))}
    </div>
  );
}

function RouteCards({ pubs }) {
  return (
    <div className="route style-cards">
      {pubs.map((p, i) => (
        <div key={p.id || i} className="route-stop">
          <div className="pub-card">
            <div className="head-row" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="num">{i + 1}</span>
              <h4 style={{ marginRight: 'auto', margin: 0 }}>{p.name}</h4>
            </div>
            {p.address && <div className="addr" style={{ marginTop: 4 }}>{p.address}</div>}
            {p.note && <div className="note">"{p.note}"</div>}
            <div className="links">
              {p.url && <a href={p.url} target="_blank" rel="noreferrer"><window.Icon name="link" size={14} /> Otevřít odkaz</a>}
              {p.mapyLabel && (
                <a href={`https://mapy.cz/zakladni?q=${encodeURIComponent(p.mapyLabel)}`} target="_blank" rel="noreferrer">
                  <window.Icon name="pin" size={14} /> Mapy.cz
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RouteMapFirst({ pubs }) {
  const pins = pubs.map(p => ({ label: p.name }));
  return (
    <div className="route style-map">
      <window.MapPlaceholder pins={pins} size="large" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {pubs.map((p, i) => (
          <div key={p.id || i} className="route-stop">
            <div className="num">{i + 1}</div>
            <div className="pub-card">
              <h4 style={{ margin: 0 }}>{p.name}</h4>
              {p.address && <div className="addr" style={{ marginTop: 2 }}>{p.address}</div>}
              {(p.url || p.mapyLabel) && (
                <div className="links">
                  {p.url && <a href={p.url} target="_blank" rel="noreferrer"><window.Icon name="link" size={14} /> Odkaz</a>}
                  {p.mapyLabel && <a href={`https://mapy.cz/zakladni?q=${encodeURIComponent(p.mapyLabel)}`} target="_blank" rel="noreferrer"><window.Icon name="pin" size={14} /> Mapy.cz</a>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function calendarLink(ev) {
  const date = ev.date.replace(/-/g, '');
  const start = date + 'T180000';
  const end = date + 'T230000';
  const title = encodeURIComponent(window.eventTitle(ev));
  const details = encodeURIComponent(
    ev.notes + '\n\n' +
    ev.pubs.map((p, i) => `${i + 1}. ${p.name}${p.address ? ' — ' + p.address : ''}`).join('\n')
  );
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
}

function DetailScreen({ state, eventId, onRoute, tweaks }) {
  const { events, setEvents, auth } = state;
  const ev = events.find(e => e.id === eventId);
  const [confirmDel, setConfirmDel] = React.useState(false);

  if (!ev) {
    return (
      <div className="shell fade-in">
        <window.BackLink onClick={() => onRoute('/')} />
        <div className="empty">
          <div className="ico">🤷</div>
          <div className="em-title">Akce nenalezena</div>
        </div>
      </div>
    );
  }

  const upcoming = window.daysUntil(ev.date) >= 0;
  const routeStyle = tweaks.routeStyle; // 'timeline' | 'cards' | 'map'

  const handleDelete = () => {
    setEvents(events.filter(e => e.id !== eventId));
    setConfirmDel(false);
    onRoute('/');
  };

  return (
    <div className="shell fade-in">
      <window.BackLink onClick={() => onRoute('/')} />

      <div className="detail-head">
        <div className="title-block">
          <div className="date-line" style={{ color: upcoming ? 'var(--pub-amber)' : 'var(--pub-mute)' }}>
            {window.fmtCzechDate(ev.date, { weekday: true })}
          </div>
          <h1>{window.eventTitle(ev)}</h1>
          <div className="detail-meta-row">
            <span className="chip">
              <span style={{ marginRight: 3 }}>👋</span>
              Organizátor: <b style={{ marginLeft: 3 }}>{ev.organizer}</b>
            </span>
            <span className="chip chip-grey">
              {ev.pubs.length} {ev.pubs.length === 1 ? 'hospoda' : ev.pubs.length >= 2 && ev.pubs.length <= 4 ? 'hospody' : 'hospod'}
            </span>
            {upcoming && (
              <a className="chip chip-green" href={calendarLink(ev)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <window.Icon name="calendar" size={12} />
                <span style={{ marginLeft: 3 }}>Do kalendáře</span>
              </a>
            )}
          </div>
        </div>
        {auth.loggedIn && (
          <div className="actions">
            <button className="icon-btn" onClick={() => onRoute(`/events/${ev.id}/edit`)} title="Upravit">
              <window.Icon name="pencil" />
            </button>
            <button className="icon-btn danger" onClick={() => setConfirmDel(true)} title="Smazat">
              <window.Icon name="trash" />
            </button>
          </div>
        )}
      </div>

      {ev.notes && (
        <div className="detail-notes">
          {ev.notes}
        </div>
      )}

      {ev.pubs.length === 0 ? (
        <div className="empty">
          <div className="ico">🗺️</div>
          <div className="em-title">Trasa ještě není naplánovaná</div>
          {auth.loggedIn && (
            <div className="em-cta">
              <button className="btn btn-primary" onClick={() => onRoute(`/events/${ev.id}/edit`)}>
                Naplánovat hospody
              </button>
            </div>
          )}
        </div>
      ) : (
        <React.Fragment>
          <div className="section-head">
            <h2>Trasa</h2>
            <span className="count">{ev.pubs.length}</span>
            <div className="line" />
          </div>

          {routeStyle === 'cards' && <RouteCards pubs={ev.pubs} />}
          {routeStyle === 'map' && <RouteMapFirst pubs={ev.pubs} />}
          {routeStyle === 'timeline' && (
            <React.Fragment>
              {/* small overview map for timeline view */}
              <window.MapPlaceholder pins={ev.pubs.map(p => ({ label: p.name }))} size="compact" />
              <RouteTimeline pubs={ev.pubs} />
            </React.Fragment>
          )}
        </React.Fragment>
      )}

      {confirmDel && (
        <window.Modal onClose={() => setConfirmDel(false)}>
          <h2>Smazat akci?</h2>
          <p>Akce <b>{window.eventTitle(ev)}</b> bude smazána. Tahle akce se nedá vrátit.</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setConfirmDel(false)}>Zrušit</button>
            <button className="btn btn-danger-filled" onClick={handleDelete}>Smazat</button>
          </div>
        </window.Modal>
      )}
    </div>
  );
}

Object.assign(window, { DetailScreen });
