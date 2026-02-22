import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import styles from "./EventForm.module.css";

const MAPY_API_KEY = import.meta.env.VITE_MAPY_API_KEY;
const EMPTY_PUB = { name: "", address: "", notes: "", url: "", mapy_lon: null, mapy_lat: null, mapy_label: "" };
const ORGANIZERS = ["MaSaK", "mbcko", "schunka"];

const EMPTY_FORM = {
  date: "",
  organizer: "",
  pubs: [{ ...EMPTY_PUB }],
  notes: "",
};

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [organizerSelect, setOrganizerSelect] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [showWishlistPicker, setShowWishlistPicker] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [pubSearch, setPubSearchState] = useState({});
  const searchTimerRef = useRef({});

  useEffect(() => {
    api.listWishlist().then(setWishlist).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api
      .getEvent(id)
      .then((event) => {
        const knownOrganizer = ORGANIZERS.includes(event.organizer);
        setOrganizerSelect(knownOrganizer ? event.organizer : "other");
        setForm({
          date: event.date.slice(0, 10),
          organizer: event.organizer,
          pubs: event.pubs.length ? event.pubs : [{ ...EMPTY_PUB }],
          notes: event.notes ?? "",
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleOrganizerSelect(value) {
    setOrganizerSelect(value);
    if (value !== "other") {
      setField("organizer", value);
    } else {
      setField("organizer", "");
    }
  }

  function setPub(index, field, value) {
    setForm((f) => {
      const pubs = f.pubs.map((p, i) => (i === index ? { ...p, [field]: value } : p));
      return { ...f, pubs };
    });
  }

  function addPub() {
    setForm((f) => ({ ...f, pubs: [...f.pubs, { ...EMPTY_PUB }] }));
  }

  function pickFromWishlist(item) {
    setForm((f) => ({
      ...f,
      pubs: [...f.pubs, { name: item.name, address: item.address, notes: item.notes, url: item.url }],
    }));
    setWishlist((w) => w.filter((i) => i._id !== item._id));
    api.deleteWishlistItem(item._id).catch(() => {});
    if (wishlist.length === 1) setShowWishlistPicker(false);
  }

  function removePub(index) {
    setForm((f) => ({ ...f, pubs: f.pubs.filter((_, i) => i !== index) }));
  }

  function movePub(index, direction) {
    setForm((f) => {
      const pubs = [...f.pubs];
      const target = index + direction;
      if (target < 0 || target >= pubs.length) return f;
      [pubs[index], pubs[target]] = [pubs[target], pubs[index]];
      return { ...f, pubs };
    });
  }

  function setPubSearch(index, updates) {
    setPubSearchState((s) => ({
      ...s,
      [index]: { query: "", results: [], open: false, ...(s[index] || {}), ...updates },
    }));
  }

  async function doMapySearch(index, query) {
    try {
      const res = await fetch(
        `https://api.mapy.com/v1/suggest?query=${encodeURIComponent(query)}&limit=5&lang=cs&apikey=${MAPY_API_KEY}`
      );
      const data = await res.json();
      setPubSearch(index, { results: data.items || [], open: true });
    } catch {
      setPubSearch(index, { results: [], open: false });
    }
  }

  function handleMapySearch(index, query) {
    setPubSearch(index, { query });
    clearTimeout(searchTimerRef.current[index]);
    if (query.length < 2) {
      setPubSearch(index, { results: [], open: false });
      return;
    }
    searchTimerRef.current[index] = setTimeout(() => doMapySearch(index, query), 350);
  }

  function selectMapyResult(index, item) {
    setForm((f) => {
      const pubs = f.pubs.map((p, i) => {
        if (i !== index) return p;
        return {
          ...p,
          mapy_lon: item.position.lon,
          mapy_lat: item.position.lat,
          mapy_label: `${item.name} – ${item.location}`,
          name: p.name || item.name,
          address: p.address || item.location,
        };
      });
      return { ...f, pubs };
    });
    setPubSearch(index, { query: "", results: [], open: false });
  }

  function clearMapyLink(index) {
    setForm((f) => {
      const pubs = f.pubs.map((p, i) =>
        i === index ? { ...p, mapy_lon: null, mapy_lat: null, mapy_label: "" } : p
      );
      return { ...f, pubs };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        name: "",
        date: new Date(form.date).toISOString(),
        pubs: form.pubs.filter((p) => p.name.trim()),
      };
      if (isEdit) {
        await api.updateEvent(id, payload);
        navigate(`/events/${id}`);
      } else {
        const created = await api.createEvent(payload);
        navigate(`/events/${created._id}`);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className={styles.page}><p>Načítám...</p></div>;

  return (
    <div className={styles.page}>
      <h1>{isEdit ? "Upravit akci" : "Nová akce"}</h1>

      {error && <p className={styles.error}>Chyba: {error}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Datum *
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setField("date", e.target.value)}
          />
        </label>

        <label>
          Organizátor *
          <select
            required={organizerSelect !== "other"}
            value={organizerSelect}
            onChange={(e) => handleOrganizerSelect(e.target.value)}
            className={styles.select}
          >
            <option value="" disabled>Vyber organizátora...</option>
            {ORGANIZERS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
            <option value="other">Jiný...</option>
          </select>
        </label>

        {organizerSelect === "other" && (
          <label>
            Jméno organizátora *
            <input
              type="text"
              required
              autoFocus
              placeholder="Zadej jméno"
              value={form.organizer}
              onChange={(e) => setField("organizer", e.target.value)}
            />
          </label>
        )}

        <label>
          Poznámky k večeru
          <textarea
            rows={3}
            placeholder="Téma, lokalita, cokoli..."
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </label>

        <fieldset className={styles.pubsField}>
          <legend>Hospody</legend>

          {form.pubs.map((pub, i) => (
            <div key={i} className={styles.pubRow}>
              <div className={styles.pubIndex}>{i + 1}.</div>
              <div className={styles.pubFields}>
                <input
                  type="text"
                  placeholder="Název hospody *"
                  value={pub.name}
                  onChange={(e) => setPub(i, "name", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Adresa (volitelná)"
                  value={pub.address}
                  onChange={(e) => setPub(i, "address", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Poznámka (volitelná, např. 'tady jíme')"
                  value={pub.notes}
                  onChange={(e) => setPub(i, "notes", e.target.value)}
                />
                <input
                  type="url"
                  placeholder="Odkaz (volitelný, např. na menu)"
                  value={pub.url}
                  onChange={(e) => setPub(i, "url", e.target.value)}
                />
                {MAPY_API_KEY && (
                  pub.mapy_lon != null ? (
                    <div className={styles.mapyLinked}>
                      <span>📍 {pub.mapy_label || "Propojeno s Mapy.cz"}</span>
                      <button type="button" onClick={() => clearMapyLink(i)} className={styles.mapyUnlink} title="Zrušit propojení">✕</button>
                    </div>
                  ) : (
                    <div className={styles.mapySearch}>
                      <input
                        type="text"
                        placeholder="🔍 Vyhledat na Mapy.cz..."
                        value={pubSearch[i]?.query ?? ""}
                        onChange={(e) => handleMapySearch(i, e.target.value)}
                        onBlur={() => setTimeout(() => setPubSearch(i, { open: false }), 150)}
                        className={styles.mapySearchInput}
                      />
                      {pubSearch[i]?.open && pubSearch[i].results.length > 0 && (
                        <ul className={styles.mapySuggest}>
                          {pubSearch[i].results.map((item, j) => (
                            <li key={j} onMouseDown={() => selectMapyResult(i, item)}>
                              <div className={styles.mapySuggestName}>{item.name}</div>
                              <div className={styles.mapySuggestLoc}>{item.location}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                )}
              </div>
              <div className={styles.pubControls}>
                <button type="button" onClick={() => movePub(i, -1)} disabled={i === 0} title="Nahoru">↑</button>
                <button type="button" onClick={() => movePub(i, 1)} disabled={i === form.pubs.length - 1} title="Dolů">↓</button>
                <button type="button" onClick={() => removePub(i)} disabled={form.pubs.length === 1} title="Odebrat">✕</button>
              </div>
            </div>
          ))}

          <div className={styles.pubButtons}>
            <button type="button" onClick={addPub} className={styles.addPub}>
              + Přidat hospodu
            </button>
            <button
              type="button"
              onClick={() => setShowWishlistPicker(true)}
              className={styles.fromWishlistBtn}
              disabled={wishlist.length === 0}
            >
              ⭐ Z wishlistu {wishlist.length > 0 && `(${wishlist.length})`}
            </button>
          </div>
        </fieldset>

        {showWishlistPicker && (
          <div className={styles.modalOverlay} onClick={() => setShowWishlistPicker(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2>Vybrat z wishlistu</h2>
              <ul className={styles.wishlistPickList}>
                {wishlist.map((item) => (
                  <li key={item._id}>
                    <div className={styles.pickItemInfo}>
                      <div className={styles.pickItemName}>{item.name}</div>
                      {item.address && <div className={styles.pickItemAddr}>{item.address}</div>}
                    </div>
                    <button type="button" onClick={() => pickFromWishlist(item)} className={styles.pickBtn}>
                      + Přidat
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => setShowWishlistPicker(false)} className={styles.modalCloseBtn}>
                Zavřít
              </button>
            </div>
          </div>
        )}

        <div className={styles.formActions}>
          <button type="button" onClick={() => navigate(-1)} className={styles.cancelBtn}>
            Zrušit
          </button>
          <button type="submit" disabled={saving} className={styles.submitBtn}>
            {saving ? "Ukládám..." : isEdit ? "Uložit změny" : "Vytvořit akci"}
          </button>
        </div>
      </form>
    </div>
  );
}
