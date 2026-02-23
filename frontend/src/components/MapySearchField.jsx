import { useRef, useState } from "react";
import styles from "./MapySearchField.module.css";

const API_KEY = import.meta.env.VITE_MAPY_API_KEY;

// lon/lat/label — current linked POI (null = not linked)
// onLink({ lon, lat, label }) — called when user picks a result
// onClear() — called when user removes the link
export default function MapySearchField({ lon, lat, label, onLink, onClear }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  async function doSearch(q) {
    try {
      const res = await fetch(
        `https://api.mapy.com/v1/suggest?query=${encodeURIComponent(q)}&limit=5&lang=cs&apikey=${API_KEY}`
      );
      const data = await res.json();
      setResults(data.items || []);
      setOpen(true);
    } catch {
      setResults([]);
      setOpen(false);
    }
  }

  function handleChange(e) {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(timerRef.current);
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(() => doSearch(q), 350);
  }

  function handleSelect(item) {
    onLink({
      lon: item.position.lon,
      lat: item.position.lat,
      label: `${item.name} – ${item.location}`,
    });
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  if (!API_KEY) return null;

  if (lon != null) {
    return (
      <div className={styles.linked}>
        <span>📍 {label || "Propojeno s Mapy.cz"}</span>
        <button type="button" onClick={onClear} className={styles.unlink} title="Zrušit propojení">
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className={styles.search}>
      <input
        type="text"
        placeholder="🔍 Vyhledat na Mapy.cz..."
        value={query}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={styles.input}
      />
      {open && results.length > 0 && (
        <ul className={styles.suggest}>
          {results.map((item, i) => (
            <li key={i} onMouseDown={() => handleSelect(item)}>
              <div className={styles.suggestName}>{item.name}</div>
              <div className={styles.suggestLoc}>{item.location}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
