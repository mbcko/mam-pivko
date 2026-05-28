import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

const PreferencesContext = createContext(null);

const DEFAULT_PREFERENCES = {
  pastVisibility: "equal",
  routeStyle: "timeline",
  density: "comfortable",
};

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    try {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(localStorage.getItem("mam-pivko-prefs") || "{}") };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  useEffect(() => {
    document.body.setAttribute("data-density", preferences.density);
    localStorage.setItem("mam-pivko-prefs", JSON.stringify(preferences));
  }, [preferences]);

  const value = useMemo(() => ({
    preferences,
    setPreference: (key, value) => setPreferences((current) => ({ ...current, [key]: value })),
  }), [preferences]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  return useContext(PreferencesContext);
}

export function Icon({ name, size = 18, ...rest }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", ...rest };
  switch (name) {
    case "plus": return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
    case "pencil": return <svg {...props}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;
    case "trash": return <svg {...props}><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>;
    case "x": return <svg {...props}><path d="M18 6 6 18M6 6l12 12" /></svg>;
    case "check": return <svg {...props}><path d="M20 6 9 17l-5-5" /></svg>;
    case "arrow-left": return <svg {...props}><path d="m15 18-6-6 6-6" /></svg>;
    case "arrow-right": return <svg {...props}><path d="m9 18 6-6-6-6" /></svg>;
    case "star": return <svg {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
    case "star-fill": return <svg {...props} fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
    case "pin": return <svg {...props}><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
    case "calendar": return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case "external": return <svg {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>;
    case "link": return <svg {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
    case "logout": return <svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
    case "drag": return <svg {...props}><circle cx="9" cy="6" r="1.5" fill="currentColor" stroke="none" /><circle cx="15" cy="6" r="1.5" fill="currentColor" stroke="none" /><circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="9" cy="18" r="1.5" fill="currentColor" stroke="none" /><circle cx="15" cy="18" r="1.5" fill="currentColor" stroke="none" /></svg>;
    case "info": return <svg {...props}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>;
    default: return null;
  }
}

export function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.5 12.27c0-.78-.07-1.53-.2-2.27H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.22-4.74 3.22-8.31Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.65l3.15-3.15C17.46 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

export function Avatar({ name, picture, size = 32 }) {
  if (picture) return <img src={picture} alt={name || ""} title={name || ""} className="avatar" style={{ width: size, height: size }} />;
  const letter = (name || "?").charAt(0).toUpperCase();
  const colors = [["#fff4dc", "#a35a00"], ["#ebfaff", "#0054a3"], ["#ebfffa", "#006657"], ["#ffebf0", "#a30b00"]];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  const [background, color] = colors[hash % colors.length];
  return <div className="avatar" title={name} style={{ width: size, height: size, background, color }}>{letter}</div>;
}

export function OrganizerChip({ name }) {
  return (
    <span className="chip organizer-chip">
      <Avatar name={name} size={18} />
      <span>{name}</span>
    </span>
  );
}

export function BackLink({ to = "/", label = "Zpět" }) {
  return <Link className="back-link" to={to}><Icon name="arrow-left" size={14} />{label}</Link>;
}

export function Modal({ children, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>{children}</div>
    </div>
  );
}

function SettingsPopover() {
  const { preferences, setPreference } = usePreferences();
  return (
    <div className="settings-popover">
      <div className="setting-group">
        <div className="setting-label">Minulé akce</div>
        <div className="seg">
          {[["equal", "Stejně"], ["faded", "Vybledlé"], ["hidden", "Skrýt"]].map(([value, label]) => (
            <button key={value} className={preferences.pastVisibility === value ? "on" : ""} onClick={() => setPreference("pastVisibility", value)}>{label}</button>
          ))}
        </div>
      </div>
      <div className="setting-group">
        <div className="setting-label">Styl trasy</div>
        <div className="seg">
          {[["timeline", "Timeline"], ["cards", "Karty"], ["map", "Mapa"]].map(([value, label]) => (
            <button key={value} className={preferences.routeStyle === value ? "on" : ""} onClick={() => setPreference("routeStyle", value)}>{label}</button>
          ))}
        </div>
      </div>
      <div className="setting-group">
        <div className="setting-label">Hustota</div>
        <div className="seg">
          {[["comfortable", "Vzdušné"], ["compact", "Husté"]].map(([value, label]) => (
            <button key={value} className={preferences.density === value ? "on" : ""} onClick={() => setPreference("density", value)}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }) {
  const { user, login, logout, authError } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api.listWishlist().then((items) => setWishlistCount(items.length)).catch(() => {});
  }, [location.pathname]);

  return (
    <div className="app">
      <header className="appbar">
        <div className="appbar-inner">
          <Link className="brand" to="/">
            <span className="mug" aria-hidden>🍺</span>
            <span>MAM&nbsp;pivko<span className="bang">!</span></span>
          </Link>
          <div className="appbar-actions">
            <Link className="btn btn-sm btn-secondary" to="/wishlist" title="Wishlist hospod">
              <Icon name="star" size={14} />
              <span className="hide-mobile">Wishlist</span>
              <span className="muted">({wishlistCount})</span>
            </Link>
            {user && location.pathname !== "/new" && (
              <button className="btn btn-sm btn-primary" onClick={() => navigate("/new")} title="Nová akce">
                <Icon name="plus" size={14} />
                <span className="hide-mobile">Nová akce</span>
              </button>
            )}
            <div className="settings-wrap">
              <button className="icon-btn" onClick={() => setSettingsOpen((open) => !open)} title="Nastavení" aria-label="Nastavení">
                <Icon name="info" size={15} />
              </button>
              {settingsOpen && <SettingsPopover />}
            </div>
            {user ? (
              <>
                <Avatar name={user.name || user.email} picture={user.picture} />
                <button className="icon-btn" onClick={logout} title="Odhlásit" aria-label="Odhlásit">
                  <Icon name="logout" size={15} />
                </button>
              </>
            ) : (
              <div className="header-google"><GoogleLogin onSuccess={login} onError={() => {}} size="medium" shape="pill" /></div>
            )}
          </div>
        </div>
      </header>
      {authError && <div className="auth-banner">{authError}</div>}
      {children}
    </div>
  );
}

export function LoginRequired() {
  const { login, authError } = useAuth();
  return (
    <div className="shell login-page">
      <div className="login-card">
        <div className="big-mug">🔒🍺</div>
        <h1>Pouze pro členy<span className="bang">!</span></h1>
        <p className="lead">{authError || "Pro vytváření a úpravy akcí se musíš přihlásit."}</p>
        <GoogleLogin onSuccess={login} onError={() => {}} size="large" width="320" />
      </div>
    </div>
  );
}
