import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import EventPubMap from "./EventPubMap.jsx";
import MapyLink from "./MapyLink.jsx";
import MapySearchField from "./MapySearchField.jsx";
import styles from "./WishlistPage.module.css";

const EMPTY_FORM = { name: "", address: "", notes: "", url: "", mapy_lon: null, mapy_lat: null, mapy_label: "" };

function ItemForm({ initial = EMPTY_FORM, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.inlineForm}>
      <input
        type="text"
        placeholder="Název hospody *"
        required
        autoFocus
        value={form.name}
        onChange={(e) => setField("name", e.target.value)}
      />
      <input
        type="text"
        placeholder="Adresa (volitelná)"
        value={form.address}
        onChange={(e) => setField("address", e.target.value)}
      />
      <input
        type="text"
        placeholder="Poznámka (volitelná)"
        value={form.notes}
        onChange={(e) => setField("notes", e.target.value)}
      />
      <input
        type="url"
        placeholder="Odkaz (volitelný)"
        value={form.url}
        onChange={(e) => setField("url", e.target.value)}
      />
      <MapySearchField
        lon={form.mapy_lon}
        lat={form.mapy_lat}
        label={form.mapy_label}
        onLink={({ lon, lat, label }) =>
          setForm((f) => ({
            ...f,
            mapy_lon: lon,
            mapy_lat: lat,
            mapy_label: label,
            name: f.name || label.split(" –")[0],
            address: f.address || label.split("– ")[1] || "",
          }))
        }
        onClear={() => setForm((f) => ({ ...f, mapy_lon: null, mapy_lat: null, mapy_label: "" }))}
      />
      <div className={styles.inlineActions}>
        <button type="submit" disabled={saving} className={styles.saveBtn}>
          {saving ? "Ukládám..." : "Uložit"}
        </button>
        <button type="button" onClick={onCancel} className={styles.cancelBtn}>
          Zrušit
        </button>
      </div>
    </form>
  );
}

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    api
      .listWishlist()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(form) {
    const item = await api.createWishlistItem(form);
    setItems((prev) => [item, ...prev]);
    setShowAddForm(false);
  }

  async function handleUpdate(id, form) {
    const updated = await api.updateWishlistItem(id, form);
    setItems((prev) => prev.map((i) => (i._id === id ? updated : i)));
    setEditingId(null);
  }

  async function handleDelete(id) {
    if (!confirm("Odebrat hospodu z wishlistu?")) return;
    await api.deleteWishlistItem(id);
    setItems((prev) => prev.filter((i) => i._id !== id));
  }

  return (
    <div className="page">
      <nav className={styles.nav}>
        <Link to="/">← Zpět</Link>
      </nav>

      <header className={styles.header}>
        <h1>⭐ Wishlist hospod</h1>
        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} className={styles.addBtn}>
            + Přidat hospodu
          </button>
        )}
      </header>

      {error && <p className={styles.error}>Chyba: {error}</p>}

      {showAddForm && (
        <div className={styles.card}>
          <ItemForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {loading && <p>Načítám...</p>}

      {!loading && !error && items.length === 0 && !showAddForm && (
        <p className={styles.empty}>Wishlist je prázdný. Přidej hospody, které chcete navštívit!</p>
      )}

      {items.length > 0 && <EventPubMap pubs={items} />}

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item._id} className={styles.card}>
            {editingId === item._id ? (
              <ItemForm
                initial={{
                  name: item.name,
                  address: item.address,
                  notes: item.notes,
                  url: item.url,
                  mapy_lon: item.mapy_lon ?? null,
                  mapy_lat: item.mapy_lat ?? null,
                  mapy_label: item.mapy_label ?? "",
                }}
                onSave={(form) => handleUpdate(item._id, form)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className={styles.itemContent}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.name}</div>
                  {item.address && <div className={styles.itemMeta}>{item.address}</div>}
                  {item.notes && <div className={styles.itemNotes}>{item.notes}</div>}
                  <div className={styles.itemLinks}>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.itemUrl}>
                        🔗 Odkaz
                      </a>
                    )}
                    <MapyLink
                      lon={item.mapy_lon}
                      lat={item.mapy_lat}
                      name={item.name}
                      address={item.address}
                      className={styles.itemUrl}
                    />
                  </div>
                </div>
                <div className={styles.itemActions}>
                  <button onClick={() => setEditingId(item._id)} className={styles.editBtn}>Upravit</button>
                  <button onClick={() => handleDelete(item._id)} className={styles.deleteBtn}>Odebrat</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
