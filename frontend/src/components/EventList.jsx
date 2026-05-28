import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { Icon, OrganizerChip, usePreferences } from "../design/Design.jsx";
import { MONTHS_CZ_SHORT, daysUntil, eventTitle, fmtCzechDate, parseDate, pluralDays, pluralHospod } from "../design/helpers.js";

function Countdown({ event, onClick }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = parseDate(event.date);
  target.setHours(18, 0, 0, 0);
  const diff = target - now;
  if (diff < 0) return null;

  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <button className="countdown fade-in reset-button" onClick={onClick}>
      <div>
        <div className="countdown-label">Příští pivko</div>
        <div className="countdown-title">{eventTitle(event)}</div>
        <div className="countdown-meta">
          {fmtCzechDate(event.date, { weekday: true })}
          {event.pubs.length > 0 && <> · {event.pubs.length} {pluralHospod(event.pubs.length)}</>}
        </div>
      </div>
      <div className="countdown-clock">
        <div className="unit"><div className="n">{days}</div><div className="u">dní</div></div>
        <div className="unit"><div className="n">{String(hours).padStart(2, "0")}</div><div className="u">hod</div></div>
        <div className="unit"><div className="n">{String(minutes).padStart(2, "0")}</div><div className="u">min</div></div>
        <div className="unit"><div className="n">{String(secs).padStart(2, "0")}</div><div className="u">sek</div></div>
      </div>
    </button>
  );
}

function EventRow({ event, faded, onClick }) {
  const date = parseDate(event.date);
  const upcoming = daysUntil(event.date) >= 0;
  const until = daysUntil(event.date);

  return (
    <button className={`event-row reset-button ${upcoming ? "upcoming" : "past"} ${faded ? "faded" : ""}`} onClick={onClick}>
      <div className="date-stamp">
        <div className="d">{date.getDate()}</div>
        <div className="m">{MONTHS_CZ_SHORT[date.getMonth()]}</div>
      </div>
      <div className="event-main">
        <h3>{eventTitle(event)}</h3>
        <div className="event-meta">
          <OrganizerChip name={event.organizer} />
          <span className="dot">·</span>
          <span>{event.pubs.length} {pluralHospod(event.pubs.length)}</span>
          {upcoming && until === 0 && <><span className="dot">·</span><span className="chip chip-soft-orange">dnes</span></>}
          {upcoming && until > 0 && until <= 14 && <><span className="dot">·</span><span className="chip">za {until} {pluralDays(until)}</span></>}
        </div>
        {event.pubs.length > 0 && (
          <div className="event-route-preview">
            {event.pubs.slice(0, 3).map((pub, index) => (
              <span className="route-preview-part" key={`${pub.name}-${index}`}>
                {index > 0 && <span className="arrow">→</span>}
                <span className="pub-pip">{pub.name}</span>
              </span>
            ))}
            {event.pubs.length > 3 && <span className="arrow">+{event.pubs.length - 3}</span>}
          </div>
        )}
      </div>
      <div style={{ color: "var(--colorGrey-300)" }}><Icon name="arrow-right" size={18} /></div>
    </button>
  );
}

function SectionHead({ title, count }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      <span className="count">{count}</span>
      <div className="line" />
    </div>
  );
}

function StreakBanner({ events }) {
  const past = events
    .filter((event) => daysUntil(event.date) < 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (past.length < 2) return null;
  const organizer = past[past.length - 1].organizer;
  let streak = 1;
  for (let i = past.length - 2; i >= 0; i--) {
    if (past[i].organizer !== organizer) break;
    streak += 1;
  }
  if (streak < 2) return null;
  return (
    <div className="streak-banner">
      <span>🔥</span>
      <span><b>{organizer}</b> organizoval poslední <b>{streak}×</b> v řadě - kdo to vezme tentokrát?</span>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="skeleton-list">
      {[0, 1, 2].map((i) => <div className="skeleton-row" key={i} />)}
    </div>
  );
}

export default function EventList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listEvents()
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const { upcoming, past } = useMemo(() => {
    const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date));
    return {
      upcoming: sorted.filter((event) => daysUntil(event.date) >= 0).sort((a, b) => a.date.localeCompare(b.date)),
      past: sorted.filter((event) => daysUntil(event.date) < 0),
    };
  }, [events]);

  return (
    <main className="shell fade-in">
      {loading && <SkeletonRows />}
      {error && <div className="error-banner">Chyba: {error}</div>}

      {!loading && !error && (
        <>
          {upcoming[0] && <Countdown event={upcoming[0]} onClick={() => navigate(`/events/${upcoming[0]._id}`)} />}
          {!user && (
            <div className="info-banner">
              <Icon name="info" size={14} />
              Procházíš jako host. Pro vytvoření akce se přihlas.
            </div>
          )}
          <StreakBanner events={events} />

          {upcoming.length > 0 && (
            <>
              <SectionHead title="Nadcházející" count={upcoming.length} />
              <div className="event-list-stack">
                {upcoming.map((event) => <EventRow key={event._id} event={event} onClick={() => navigate(`/events/${event._id}`)} />)}
              </div>
            </>
          )}

          {past.length > 0 && preferences.pastVisibility !== "hidden" && (
            <>
              <SectionHead title="Proběhlo" count={past.length} />
              <div className="event-list-stack">
                {past.map((event) => (
                  <EventRow
                    key={event._id}
                    event={event}
                    faded={preferences.pastVisibility === "faded"}
                    onClick={() => navigate(`/events/${event._id}`)}
                  />
                ))}
              </div>
            </>
          )}

          {events.length === 0 && (
            <div className="empty">
              <div className="ico">🍺</div>
              <div className="em-title">Zatím tu nic není</div>
              <div>Začni první pub crawl tlačítkem nahoře.</div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
