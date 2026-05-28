import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { BackLink, Icon, Modal, usePreferences } from "../design/Design.jsx";
import { daysUntil, eventTitle, fmtCzechDate, normalizePub, pluralHospod } from "../design/helpers.js";
import EventPubMap from "./EventPubMap.jsx";
import MapyLink from "./MapyLink.jsx";

function buildCalendarUrl(event, members) {
  const title = eventTitle(event);
  const dateStr = event.date.slice(0, 10).replace(/-/g, "");
  const details = [event.notes, "", ...event.pubs.map((p, i) => `${i + 1}. ${p.name}${p.address ? ` - ${p.address}` : ""}`)]
    .filter(Boolean)
    .join("\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${dateStr}T180000/${dateStr}T230000`,
    ctz: "Europe/Prague",
    details,
    location: event.pubs[0]?.address || event.pubs[0]?.name || "",
  });
  if (members.length) params.set("add", members.join(","));
  return `https://calendar.google.com/calendar/render?${params}`;
}

function PubCard({ pub }) {
  const normalized = normalizePub(pub);
  return (
    <div className="pub-card">
      <h4>{normalized.name || <span className="muted">Bez jména</span>}</h4>
      {normalized.address && <div className="addr">{normalized.address}</div>}
      {normalized.notes && <div className="note">"{normalized.notes}"</div>}
      <div className="links">
        {normalized.url && <a href={normalized.url} target="_blank" rel="noreferrer"><Icon name="link" size={14} /> Otevřít odkaz</a>}
        <MapyLink
          lon={normalized.mapy_lon}
          lat={normalized.mapy_lat}
          name={normalized.name}
          address={normalized.address}
          className=""
        />
      </div>
    </div>
  );
}

function RouteTimeline({ pubs }) {
  return (
    <div className="route style-timeline">
      {pubs.map((pub, index) => (
        <div key={`${pub.name}-${index}`} className="route-stop">
          <div className="num">{index + 1}</div>
          <PubCard pub={pub} />
        </div>
      ))}
    </div>
  );
}

function RouteCards({ pubs }) {
  return (
    <div className="route style-cards">
      {pubs.map((pub, index) => (
        <div key={`${pub.name}-${index}`} className="route-stop">
          <div className="num">{index + 1}</div>
          <PubCard pub={pub} />
        </div>
      ))}
    </div>
  );
}

function RouteMapFirst({ pubs }) {
  return (
    <div className="route style-map">
      <div className="map-wrap large real-map"><EventPubMap pubs={pubs} /></div>
      <RouteTimeline pubs={pubs} />
    </div>
  );
}

function SectionHead({ count }) {
  return (
    <div className="section-head">
      <h2>Trasa</h2>
      <span className="count">{count}</span>
      <div className="line" />
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, members } = useAuth();
  const { preferences } = usePreferences();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api.getEvent(id)
      .then(setEvent)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    await api.deleteEvent(id);
    navigate("/");
  }

  if (loading) return <main className="shell"><div className="skeleton-row tall" /></main>;
  if (error) return <main className="shell"><div className="error-banner">Chyba: {error}</div></main>;
  if (!event) return null;

  const upcoming = daysUntil(event.date) >= 0;

  return (
    <main className="shell fade-in">
      <BackLink to="/" />

      <div className="detail-head">
        <div className="title-block">
          <div className="date-line" style={{ color: upcoming ? "var(--pub-amber)" : "var(--pub-mute)" }}>
            {fmtCzechDate(event.date, { weekday: true })}
          </div>
          <h1>{eventTitle(event)}</h1>
          <div className="detail-meta-row">
            <span className="chip"><span>👋</span> Organizátor: <b>{event.organizer}</b></span>
            <span className="chip chip-grey">{event.pubs.length} {pluralHospod(event.pubs.length)}</span>
            {upcoming && (
              <a className="chip chip-green" href={buildCalendarUrl(event, members)} target="_blank" rel="noreferrer">
                <Icon name="calendar" size={12} /> Do kalendáře
              </a>
            )}
          </div>
        </div>
        {user && (
          <div className="actions">
            <Link className="icon-btn" to={`/events/${id}/edit`} title="Upravit"><Icon name="pencil" /></Link>
            <button className="icon-btn danger" onClick={() => setConfirmDelete(true)} title="Smazat"><Icon name="trash" /></button>
          </div>
        )}
      </div>

      {event.notes && <div className="detail-notes">{event.notes}</div>}

      {event.pubs.length === 0 ? (
        <div className="empty">
          <div className="ico">🗺️</div>
          <div className="em-title">Trasa ještě není naplánovaná</div>
          {user && <div className="em-cta"><Link className="btn btn-primary" to={`/events/${id}/edit`}>Naplánovat hospody</Link></div>}
        </div>
      ) : (
        <>
          <SectionHead count={event.pubs.length} />
          {preferences.routeStyle === "map" && <RouteMapFirst pubs={event.pubs} />}
          {preferences.routeStyle === "cards" && <RouteCards pubs={event.pubs} />}
          {preferences.routeStyle === "timeline" && (
            <>
              <div className="map-wrap compact real-map"><EventPubMap pubs={event.pubs} /></div>
              <RouteTimeline pubs={event.pubs} />
            </>
          )}
        </>
      )}

      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(false)}>
          <h2>Smazat akci?</h2>
          <p>Akce <b>{eventTitle(event)}</b> bude smazána. Tahle akce se nedá vrátit.</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>Zrušit</button>
            <button className="btn btn-danger-filled" onClick={handleDelete}>Smazat</button>
          </div>
        </Modal>
      )}
    </main>
  );
}
