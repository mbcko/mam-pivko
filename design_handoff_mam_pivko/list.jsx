// list.jsx — Event list (home) screen
// Exposes: window.ListScreen

function Countdown({ event, onClick }) {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  // event date is a date (no time) — show countdown to 18:00 of that day
  const target = window.parseDate(event.date);
  target.setHours(18, 0, 0, 0);
  const diff = target - now;
  if (diff < 0) {
    return null;
  }
  const sec = Math.floor(diff / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return (
    <div className="countdown fade-in" onClick={onClick} role="button" tabIndex={0}>
      <div>
        <div className="countdown-label">Příští pivko</div>
        <div className="countdown-title">{window.eventTitle(event)}</div>
        <div className="countdown-meta">
          {window.fmtCzechDate(event.date, { weekday: true })}
          {event.pubs.length > 0 && <React.Fragment> · {event.pubs.length} hospod</React.Fragment>}
        </div>
      </div>
      <div className="countdown-clock">
        <div className="unit"><div className="n">{d}</div><div className="u">dní</div></div>
        <div className="unit"><div className="n">{String(h).padStart(2,'0')}</div><div className="u">hod</div></div>
        <div className="unit"><div className="n">{String(m).padStart(2,'0')}</div><div className="u">min</div></div>
        <div className="unit"><div className="n">{String(s).padStart(2,'0')}</div><div className="u">sek</div></div>
      </div>
    </div>
  );
}

function EventRow({ ev, onClick, faded }) {
  const upcoming = window.daysUntil(ev.date) >= 0;
  const date = window.parseDate(ev.date);
  return (
    <div
      className={`event-row ${upcoming ? 'upcoming' : 'past'} ${faded ? 'faded' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="date-stamp">
        <div className="d">{date.getDate()}</div>
        <div className="m">{window.MONTHS_CZ_SHORT[date.getMonth()]}</div>
      </div>
      <div className="event-main">
        <h3>{window.eventTitle(ev)}</h3>
        <div className="event-meta">
          <window.OrganizerChip name={ev.organizer} />
          <span className="dot">·</span>
          <span>{ev.pubs.length} {pluralHospod(ev.pubs.length)}</span>
          {upcoming && (() => {
            const d = window.daysUntil(ev.date);
            if (d === 0) return <React.Fragment><span className="dot">·</span><span className="chip chip-soft-orange">dnes</span></React.Fragment>;
            if (d <= 14) return <React.Fragment><span className="dot">·</span><span className="chip">za {d} {pluralDays(d)}</span></React.Fragment>;
            return null;
          })()}
        </div>
        {ev.pubs.length > 0 && (
          <div className="event-route-preview">
            {ev.pubs.slice(0, 3).map((p, i) => (
              <React.Fragment key={p.id}>
                {i > 0 && <span className="arrow">→</span>}
                <span className="pub-pip">{p.name}</span>
              </React.Fragment>
            ))}
            {ev.pubs.length > 3 && <span className="arrow">+{ev.pubs.length - 3}</span>}
          </div>
        )}
      </div>
      <div style={{ color: 'var(--colorGrey-300)' }}>
        <window.Icon name="arrow-right" size={18} />
      </div>
    </div>
  );
}

function pluralHospod(n) {
  if (n === 1) return 'hospoda';
  if (n >= 2 && n <= 4) return 'hospody';
  return 'hospod';
}
function pluralDays(n) {
  if (n === 1) return 'den';
  if (n >= 2 && n <= 4) return 'dny';
  return 'dní';
}

function StreakBanner({ events }) {
  // The longest organizer streak — playful
  const pastSorted = events
    .filter(e => !window.isFuture(e.date) && !window.isToday(e.date))
    .sort((a, b) => a.date.localeCompare(b.date));
  if (pastSorted.length < 2) return null;
  // count consecutive same organizer at the end
  const last = pastSorted[pastSorted.length - 1].organizer;
  let streak = 1;
  for (let i = pastSorted.length - 2; i >= 0; i--) {
    if (pastSorted[i].organizer === last) streak++;
    else break;
  }
  if (streak < 2) return null;
  return (
    <div style={{ fontSize: 12, color: 'var(--pub-mute)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 14 }}>🔥</span>
      <span><b style={{ color: 'var(--pub-ink)' }}>{last}</b> organizoval poslední <b>{streak}×</b> v řadě — kdo to vezme tentokrát?</span>
    </div>
  );
}

function ListScreen({ state, onRoute, tweaks }) {
  const { events, auth } = state;

  const sorted = React.useMemo(
    () => [...events].sort((a, b) => b.date.localeCompare(a.date)),
    [events]
  );
  const upcoming = sorted.filter(e => window.daysUntil(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const past = sorted.filter(e => window.daysUntil(e.date) < 0);
  const nextEvent = upcoming[0];

  const pastVisibility = tweaks.pastVisibility; // 'equal' | 'faded' | 'hidden'

  return (
    <div className="shell fade-in">
      {nextEvent && (
        <Countdown
          event={nextEvent}
          onClick={() => onRoute(`/events/${nextEvent.id}`)}
        />
      )}

      {!auth.loggedIn && (
        <div style={{ background: 'var(--colorBrandPrimary-100)', color: 'var(--colorBrandPrimary-500)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <window.Icon name="info" size={14} />
          Procházíš jako host. Pro vytvoření akce se přihlas.
        </div>
      )}

      <StreakBanner events={events} />

      {upcoming.length > 0 && (
        <React.Fragment>
          <div className="section-head">
            <h2>Nadcházející</h2>
            <span className="count">{upcoming.length}</span>
            <div className="line" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcoming.map(ev => (
              <EventRow
                key={ev.id}
                ev={ev}
                onClick={() => onRoute(`/events/${ev.id}`)}
              />
            ))}
          </div>
        </React.Fragment>
      )}

      {past.length > 0 && pastVisibility !== 'hidden' && (
        <React.Fragment>
          <div className="section-head">
            <h2>Proběhlo</h2>
            <span className="count">{past.length}</span>
            <div className="line" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {past.map(ev => (
              <EventRow
                key={ev.id}
                ev={ev}
                onClick={() => onRoute(`/events/${ev.id}`)}
                faded={pastVisibility === 'faded'}
              />
            ))}
          </div>
        </React.Fragment>
      )}

      {events.length === 0 && (
        <div className="empty">
          <div className="ico">🍺</div>
          <div className="em-title">Zatím tu nic není</div>
          <div>Začni první pub crawl tlačítkem nahoře.</div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ListScreen });
