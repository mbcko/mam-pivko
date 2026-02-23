import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import styles from "./EventList.module.css";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function pubLabel(n) {
  if (n === 1) return "1 hospoda";
  if (n >= 2 && n <= 4) return `${n} hospody`;
  return `${n} hospod`;
}

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.listEvents(), api.listWishlist()])
      .then(([evts, wish]) => {
        setEvents(evts);
        setWishlistCount(wish.length);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>🍺 MAM Pivko</h1>
        <nav className={styles.headerNav}>
          <Link to="/wishlist" className={styles.wishlistLink}>
            Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
          </Link>
          <Link to="/events/new" className={styles.newBtn}>+ Nová akce</Link>
        </nav>
      </header>

      {loading && <p>Načítám...</p>}
      {error && <p className={styles.error}>Chyba: {error}</p>}

      {!loading && !error && events.length === 0 && (
        <p className={styles.empty}>Zatím žádné akce. Naplánuj první!</p>
      )}

      <ul className={styles.list}>
        {events.map((event) => (
          <li
            key={event._id}
            className={`${styles.item}${new Date(event.date) > new Date() ? ` ${styles.future}` : ""}`}
          >
            <Link to={`/events/${event._id}`}>
              <div className={styles.date}>{formatDate(event.date)}</div>
              <div className={styles.title}>
                {event.name || `MAM Pivko — ${event.organizer}`}
              </div>
              <div className={styles.meta}>
                Organizátor: {event.organizer} · {pubLabel(event.pubs.length)}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
