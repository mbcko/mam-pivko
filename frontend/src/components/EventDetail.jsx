import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import styles from "./EventDetail.module.css";
import EventPubMap from "./EventPubMap.jsx";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("cs-CZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  if (loading) return <div className={styles.page}><p>Načítám...</p></div>;
  if (error) return <div className={styles.page}><p className={styles.error}>Chyba: {error}</p></div>;
  if (!event) return null;

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/">← Zpět</Link>
      </nav>

      <header className={styles.header}>
        <div>
          <div className={styles.date}>{formatDate(event.date)}</div>
          <h1>{event.name || `MAM Pivko — ${event.organizer}`}</h1>
          <div className={styles.meta}>Organizátor: <strong>{event.organizer}</strong></div>
        </div>
        <div className={styles.actions}>
          <Link to={`/events/${id}/edit`} className={styles.editBtn}>Upravit</Link>
          <button onClick={handleDelete} className={styles.deleteBtn}>Smazat</button>
        </div>
      </header>

      {event.notes && <p className={styles.notes}>{event.notes}</p>}

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
              {(pub.name || pub.address) && (
                <a
                  href={`https://mapy.cz/zakladni?q=${encodeURIComponent([pub.name, pub.address].filter(Boolean).join(", "))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.pubUrl}
                >
                  📍 Mapy.cz
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
