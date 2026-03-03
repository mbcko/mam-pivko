import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { formatDateLong } from "../utils/format.js";
import styles from "./EventDetail.module.css";
import EventPubMap from "./EventPubMap.jsx";
import MapyLink from "./MapyLink.jsx";
import LoadingMessage from "./LoadingMessage.jsx";

function buildCalendarUrl(event, members) {
  const title = event.name || `MAM Pivko — ${event.organizer}`;
  const dateStr = event.date.replace(/-/g, "");
  const nextDay = new Date(event.date);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDateStr = nextDay.toISOString().slice(0, 10).replace(/-/g, "");
  const details = event.pubs
    .map((p, i) => `${i + 1}. ${p.name}${p.address ? ` — ${p.address}` : ""}`)
    .join("\n");
  const location = event.pubs[0]?.address || event.pubs[0]?.name || "";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${dateStr}/${nextDateStr}`,
    details,
    location,
  });
  if (members.length) params.set("add", members.join(","));

  return `https://calendar.google.com/calendar/render?${params}`;
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, members } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getEvent(id)
      .then(setEvent)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Opravdu smazat tuto akci?")) return;
    await api.deleteEvent(id);
    navigate("/");
  }

  if (loading) return <div className="page"><LoadingMessage /></div>;
  if (error) return <div className="page"><p className={styles.error}>Chyba: {error}</p></div>;
  if (!event) return null;

  return (
    <div className="page">
      <nav className={styles.nav}>
        <Link to="/">← Zpět</Link>
      </nav>

      <header className={styles.header}>
        <div>
          <div className={styles.date}>{formatDateLong(event.date)}</div>
          <h1>{event.name || `MAM Pivko — ${event.organizer}`}</h1>
          <div className={styles.meta}>Organizátor: <strong>{event.organizer}</strong></div>
        </div>
        <div className={styles.actions}>
          {user ? (
            <Link to={`/events/${id}/edit`} className={styles.editBtn}>Upravit</Link>
          ) : (
            <span className={`${styles.editBtn} ${styles.btnDisabled}`} title="Přihlaš se pro úpravy">Upravit</span>
          )}
          {user ? (
            <button onClick={handleDelete} className={styles.deleteBtn}>Smazat</button>
          ) : (
            <button disabled className={`${styles.deleteBtn} ${styles.btnDisabled}`}>Smazat</button>
          )}
        </div>
      </header>

      {event.notes && <p className={styles.notes}>{event.notes}</p>}

      {user && (
        <a
          href={buildCalendarUrl(event, members)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.calendarBtn}
        >
          📅 Pozvat do kalendáře
        </a>
      )}

      <h2>Hospody</h2>
      <EventPubMap pubs={event.pubs} />
      <ol className={styles.pubs}>
        {event.pubs.map((pub, i) => (
          <li key={i} className={styles.pub}>
            <div className={styles.pubName}>{pub.name}</div>
            {pub.address && <div className={styles.pubAddress}>{pub.address}</div>}
            {pub.notes && <div className={styles.pubNotes}>{pub.notes}</div>}
            <div className={styles.pubLinks}>
              {pub.url && (
                <a href={pub.url} target="_blank" rel="noopener noreferrer" className={styles.pubUrl}>
                  🔗 Otevřít odkaz
                </a>
              )}
              <MapyLink
                lon={pub.mapy_lon}
                lat={pub.mapy_lat}
                name={pub.name}
                address={pub.address}
                className={styles.pubUrl}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
