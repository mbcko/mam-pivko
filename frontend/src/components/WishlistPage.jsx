import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { BackLink, Icon, Modal } from "../design/Design.jsx";
import { countWishlistVisits } from "../design/helpers.js";
import EventPubMap from "./EventPubMap.jsx";
import MapySearchField from "./MapySearchField.jsx";

const EMPTY_FORM = { name: "", address: "", notes: "", url: "", mapy_lon: null, mapy_lat: null, mapy_label: "" };

function ItemForm({ initial = EMPTY_FORM, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card wishlist-edit-card">
      <div className="field"><input className="input" required autoFocus placeholder="Název hospody *" value={form.name} onChange={(e) => setField("name", e.target.value)} /></div>
      <div className="field"><input className="input" placeholder="Adresa (volitelná)" value={form.address} onChange={(e) => setField("address", e.target.value)} /></div>
      <div className="field"><input className="input" placeholder="Poznámka (volitelná)" value={form.notes} onChange={(e) => setField("notes", e.target.value)} /></div>
      <div className="field"><input className="input" type="url" placeholder="Odkaz (volitelný)" value={form.url} onChange={(e) => setField("url", e.target.value)} /></div>
      <MapySearchField
        lon={form.mapy_lon}
        lat={form.mapy_lat}
        label={form.mapy_label}
        onLink={({ lon, lat, label }) => setForm((current) => ({
          ...current,
          mapy_lon: lon,
          mapy_lat: lat,
          mapy_label: label,
          name: current.name || label.split(" –")[0],
          address: current.address || label.split("– ")[1] || "",
        }))}
        onClear={() => setForm((current) => ({ ...current, mapy_lon: null, mapy_lat: null, mapy_label: "" }))}
      />
      <div className="row">
        <button className="btn btn-primary" type="submit" disabled={saving}><Icon name="check" size={14} /> {saving ? "Ukládám..." : "Uložit"}</button>
        <button className="btn btn-ghost" type="button" onClick={onCancel}>Zrušit</button>
      </div>
    </form>
  );
}

function WishlistRow({ item, index, visits, canEdit, onEdit, onDelete }) {
  return (
    <div className="wish-row">
      <div className="num">{index + 1}</div>
      <div className="info">
        <div className="name">
          {item.name}
          {item.mapy_lon == null && <span className="chip no-map-chip" title="Bez map dat"><Icon name="pin" size={12} /></span>}
        </div>
        {item.address && <div className="addr">{item.address}</div>}
        <div className="meta">
          {visits > 0 ? <span className="visits">🍻 {visits} {visits === 1 ? "návštěva" : visits >= 2 && visits <= 4 ? "návštěvy" : "návštěv"}</span> : <span className="last">Zatím nenavštíveno</span>}
          {item.notes && <span className="last" style={{ fontStyle: "italic" }}>"{item.notes}"</span>}
        </div>
      </div>
      <div className="actions">
        <a
          className="icon-btn"
          href={item.mapy_lon != null
            ? `https://mapy.cz/zakladni?x=${item.mapy_lon}&y=${item.mapy_lat}&z=17`
            : `https://mapy.cz/zakladni?q=${encodeURIComponent([item.name, item.address].filter(Boolean).join(", "))}`}
          target="_blank"
          rel="noreferrer"
          title="Mapy.cz"
        >
          <Icon name="pin" size={16} />
        </a>
        {canEdit && (
          <>
            <button className="icon-btn" onClick={onEdit} title="Upravit"><Icon name="pencil" /></button>
            <button className="icon-btn danger" onClick={onDelete} title="Odebrat"><Icon name="trash" /></button>
          </>
        )}
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    Promise.all([api.listWishlist(), api.listEvents()])
      .then(([wishlist, eventList]) => {
        setItems(wishlist);
        setEvents(eventList);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const enriched = useMemo(() => items.map((item) => ({ ...item, visits: countWishlistVisits(item, events) })), [items, events]);
  const sorted = useMemo(() => [...enriched].sort((a, b) => {
    const mapSort = (a.mapy_lon == null ? 1 : 0) - (b.mapy_lon == null ? 1 : 0);
    return mapSort || a.name.localeCompare(b.name, "cs");
  }), [enriched]);
  const hot = [...enriched].filter((item) => item.visits > 0).sort((a, b) => b.visits - a.visits)[0];

  async function handleAdd(form) {
    const item = await api.createWishlistItem(form);
    setItems((current) => [item, ...current]);
    setEditingId(null);
  }

  async function handleUpdate(id, form) {
    const updated = await api.updateWishlistItem(id, form);
    setItems((current) => current.map((item) => (item._id === id ? updated : item)));
    setEditingId(null);
  }

  async function handleDelete(id) {
    await api.deleteWishlistItem(id);
    setItems((current) => current.filter((item) => item._id !== id));
    setConfirmDelete(null);
  }

  return (
    <main className="shell wide fade-in">
      <BackLink to="/" />
      <div className="form-title-row">
        <h1><span style={{ marginRight: 6 }}>⭐</span>Wishlist hospod</h1>
        {user && editingId !== "new" && <button className="btn btn-primary" onClick={() => setEditingId("new")}><Icon name="plus" size={14} /> Přidat hospodu</button>}
      </div>

      {loading && <div className="skeleton-row tall" />}
      {error && <div className="error-banner">Chyba: {error}</div>}

      {!loading && !error && (
        <>
          {items.length > 0 && <div className="map-wrap compact real-map"><EventPubMap pubs={items} /></div>}
          {hot && <div className="hot-banner"><span>🏆</span><span>Nejnavštěvovanější: <b>{hot.name}</b> · {hot.visits}× pivko</span></div>}
          {editingId === "new" && <ItemForm onSave={handleAdd} onCancel={() => setEditingId(null)} />}

          {items.length === 0 ? (
            <div className="empty">
              <div className="ico">⭐</div>
              <div className="em-title">Wishlist je prázdný</div>
              <div>Přidej hospodu, na kterou by ses chtěl vrátit nebo nově vyrazit.</div>
            </div>
          ) : (
            <div className="wishlist-grid">
              {sorted.map((item, index) => editingId === item._id ? (
                <div key={item._id} style={{ gridColumn: "1 / -1" }}>
                  <ItemForm
                    initial={{ name: item.name, address: item.address, notes: item.notes, url: item.url, mapy_lon: item.mapy_lon, mapy_lat: item.mapy_lat, mapy_label: item.mapy_label }}
                    onSave={(form) => handleUpdate(item._id, form)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <WishlistRow
                  key={item._id}
                  item={item}
                  index={index}
                  visits={item.visits}
                  canEdit={Boolean(user)}
                  onEdit={() => setEditingId(item._id)}
                  onDelete={() => setConfirmDelete(item._id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)}>
          <h2>Odebrat z wishlistu?</h2>
          <p><b>{items.find((item) => item._id === confirmDelete)?.name}</b> bude odebrán z wishlistu.</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Zrušit</button>
            <button className="btn btn-danger-filled" onClick={() => handleDelete(confirmDelete)}>Odebrat</button>
          </div>
        </Modal>
      )}
    </main>
  );
}
