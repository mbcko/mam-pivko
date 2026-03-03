import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { formatDate } from "../utils/format.js";
import styles from "./EventList.module.css";
import LoadingMessage from "./LoadingMessage.jsx";

function pubLabel(n) {
  if (n === 1) return "1 hospoda";
  if (n >= 2 && n <= 4) return `${n} hospody`;
  return `${n} hospod`;
}

export default function EventList() {
  const { user, login, logout, authError } = useAuth();
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
    <div className="page">
      <header className={styles.header}>
        <h1>🍺 MAM Pivko</h1>
        <nav className={styles.headerNav}>
          <Link to="/wishlist" className={styles.wishlistLink}>
            Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
          </Link>
          {user ? (
            <Link to="/events/new" className={styles.newBtn}>+ Nová akce</Link>
          ) : (
            <span className={`${styles.newBtn} ${styles.newBtnDisabled}`} title="Přihlaš se pro přidání akcí">
              + Nová akce
            </span>
          )}
          {user ? (
            <div className={styles.userInfo}>
              <img src={user.picture} alt={user.name} title={user.name} className={styles.avatar} />
              <button onClick={logout} className={styles.logoutBtn}>Odhlásit</button>
            </div>
          ) : (
            <GoogleLogin onSuccess={login} onError={() => {}} size="medium" shape="pill" />
          )}
          {authError && <p className={styles.authError}>{authError}</p>}
        </nav>
      </header>

      {loading && <LoadingMessage />}
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
