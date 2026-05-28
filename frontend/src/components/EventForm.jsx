import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { BackLink, Icon, LoginRequired, Modal } from "../design/Design.jsx";
import { eventTitle } from "../design/helpers.js";
import MapySearchField from "./MapySearchField.jsx";

const ORGANIZERS = ["MaSaK", "mbcko", "schunka"];
const EMPTY_PUB = { name: "", address: "", notes: "", url: "", mapy_lon: null, mapy_lat: null, mapy_label: "" };

function newPub(overrides = {}) {
  return { ...EMPTY_PUB, _id: crypto.randomUUID(), ...overrides };
}

function SortablePubRow({ id, pub, index, total, error, onChange, onRemove, onToggleWishlist, inWishlist, onSetMapy, onClearMapy }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`pub-row ${isDragging ? "dragging" : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button type="button" className="handle" title="Přesunout" {...attributes} {...listeners}>
        <Icon name="drag" size={16} />
      </button>
      <div className="num-badge">{index + 1}</div>
      <div className="fields">
        <input className="input" placeholder="Název hospody *" value={pub.name} onChange={(e) => onChange("name", e.target.value)} />
        {error && <div className="field-error">{error}</div>}
        <input className="input" placeholder="Adresa (volitelná)" value={pub.address} onChange={(e) => onChange("address", e.target.value)} />
        <input className="input" placeholder="Poznámka (volitelná, např. 'tady jíme')" value={pub.notes} onChange={(e) => onChange("notes", e.target.value)} />
        <input className="input" type="url" placeholder="Odkaz (volitelný, např. na menu)" value={pub.url} onChange={(e) => onChange("url", e.target.value)} />
        <MapySearchField lon={pub.mapy_lon} lat={pub.mapy_lat} label={pub.mapy_label} onLink={onSetMapy} onClear={onClearMapy} />
      </div>
      <div className="actions">
        <button type="button" className={`wishlist-toggle ${inWishlist ? "on" : ""}`} onClick={onToggleWishlist} title={inWishlist ? "Odebrat z wishlistu" : "Přidat do wishlistu"}>
          <Icon name={inWishlist ? "star-fill" : "star"} size={16} />
        </button>
        <button type="button" className="icon-btn danger" onClick={onRemove} disabled={total === 1} title="Odebrat">
          <Icon name="x" />
        </button>
      </div>
    </div>
  );
}

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, sessionChecked } = useAuth();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ date: "", organizer: "", name: "", notes: "", pubs: [newPub()] });
  const [organizerSelect, setOrganizerSelect] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [showWishlistPicker, setShowWishlistPicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!user) return;
    api.listWishlist().then(setWishlist).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!isEdit || !user) return;
    api.getEvent(id)
      .then((event) => {
        const knownOrganizer = ORGANIZERS.includes(event.organizer);
        setOrganizerSelect(knownOrganizer ? event.organizer : "other");
        setForm({
          date: event.date.slice(0, 10),
          organizer: event.organizer,
          name: event.name || "",
          notes: event.notes || "",
          pubs: event.pubs.length ? event.pubs.map((pub) => newPub(pub)) : [newPub()],
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit, user]);

  if (!sessionChecked) return <main className="shell"><div className="skeleton-row tall" /></main>;
  if (!user) return <LoginRequired />;
  if (loading) return <main className="shell"><div className="skeleton-row tall" /></main>;

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleOrganizerSelect(value) {
    setOrganizerSelect(value);
    setField("organizer", value === "other" ? "" : value);
  }

  function setPub(index, field, value) {
    setForm((current) => ({
      ...current,
      pubs: current.pubs.map((pub, i) => (i === index ? { ...pub, [field]: value } : pub)),
    }));
  }

  function setMapyPub(index, { lon, lat, label }) {
    setForm((current) => ({
      ...current,
      pubs: current.pubs.map((pub, i) => i === index ? {
        ...pub,
        mapy_lon: lon,
        mapy_lat: lat,
        mapy_label: label,
        name: pub.name || label.split(" –")[0],
        address: pub.address || label.split("– ")[1] || "",
      } : pub),
    }));
  }

  function clearMapyPub(index) {
    setForm((current) => ({
      ...current,
      pubs: current.pubs.map((pub, i) => i === index ? { ...pub, mapy_lon: null, mapy_lat: null, mapy_label: "" } : pub),
    }));
  }

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    setForm((current) => {
      const oldIndex = current.pubs.findIndex((pub) => pub._id === active.id);
      const newIndex = current.pubs.findIndex((pub) => pub._id === over.id);
      return { ...current, pubs: arrayMove(current.pubs, oldIndex, newIndex) };
    });
  }

  function inWishlist(pub) {
    return Boolean(pub.name && wishlist.some((item) => item.name.toLowerCase() === pub.name.toLowerCase()));
  }

  async function toggleWishlist(index) {
    const pub = form.pubs[index];
    if (!pub.name.trim()) return;
    const existing = wishlist.find((item) => item.name.toLowerCase() === pub.name.toLowerCase());
    if (existing) {
      await api.deleteWishlistItem(existing._id);
      setWishlist((items) => items.filter((item) => item._id !== existing._id));
    } else {
      const created = await api.createWishlistItem(pub);
      setWishlist((items) => [created, ...items]);
    }
  }

  function pickFromWishlist(item) {
    setForm((current) => ({
      ...current,
      pubs: [...current.pubs, newPub({
        name: item.name,
        address: item.address,
        notes: item.notes,
        url: item.url,
        mapy_lon: item.mapy_lon,
        mapy_lat: item.mapy_lat,
        mapy_label: item.mapy_label,
      })],
    }));
    setShowWishlistPicker(false);
  }

  function validate() {
    const next = {};
    if (!form.date) next.date = "Zadej datum";
    if (!form.organizer.trim()) next.organizer = "Vyber organizátora";
    form.pubs.forEach((pub, index) => {
      if (!pub.name.trim()) next[`pub-${index}`] = "Zadej název hospody";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        date: new Date(form.date).toISOString(),
        pubs: form.pubs.map(({ _id, ...pub }) => pub),
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

  async function handleDelete() {
    await api.deleteEvent(id);
    navigate("/");
  }

  return (
    <main className="shell fade-in">
      <BackLink to={isEdit ? `/events/${id}` : "/"} />
      <form onSubmit={handleSubmit}>
        <div className="form-title-row">
          <h1>{isEdit ? "Upravit akci" : "Nová akce"}</h1>
          {isEdit && <button type="button" className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(true)}><Icon name="trash" size={14} /> Smazat</button>}
        </div>

        {error && <div className="error-banner">Chyba: {error}</div>}

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="field">
            <label className="field-label">Datum<span className="req">*</span></label>
            <input type="date" className="input" value={form.date} onChange={(e) => setField("date", e.target.value)} />
            {errors.date && <div className="field-error">{errors.date}</div>}
          </div>
          <div className="field">
            <label className="field-label">Organizátor<span className="req">*</span></label>
            <select className="select" value={organizerSelect} onChange={(e) => handleOrganizerSelect(e.target.value)}>
              <option value="" disabled>Vyber organizátora...</option>
              {ORGANIZERS.map((organizer) => <option key={organizer} value={organizer}>{organizer}</option>)}
              <option value="other">Jiný...</option>
            </select>
            {organizerSelect === "other" && <input className="input" placeholder="Zadej jméno" value={form.organizer} onChange={(e) => setField("organizer", e.target.value)} />}
            {errors.organizer && <div className="field-error">{errors.organizer}</div>}
          </div>
          <div className="field">
            <label className="field-label">Název (volitelný)</label>
            <input className="input" placeholder={`Výchozí: MAM Pivko — ${form.organizer || "organizátor"}`} value={form.name} onChange={(e) => setField("name", e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label">Poznámky k večeru</label>
            <textarea className="textarea" placeholder="Téma, lokalita, sraz, cokoli..." value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
          </div>
        </div>

        <div className="card">
          <div className="row between" style={{ marginBottom: 8 }}>
            <div className="row"><h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Hospody</h3><span className="chip chip-grey">{form.pubs.length}</span></div>
            <span className="muted" style={{ fontSize: 12 }}>táhni pro přeskupení</span>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={form.pubs.map((pub) => pub._id)} strategy={verticalListSortingStrategy}>
              <div className="pubs-list">
                {form.pubs.map((pub, index) => (
                  <SortablePubRow
                    key={pub._id}
                    id={pub._id}
                    pub={pub}
                    index={index}
                    total={form.pubs.length}
                    error={errors[`pub-${index}`]}
                    onChange={(field, value) => setPub(index, field, value)}
                    onRemove={() => setForm((current) => ({ ...current, pubs: current.pubs.filter((_, i) => i !== index) || [newPub()] }))}
                    onToggleWishlist={() => toggleWishlist(index)}
                    inWishlist={inWishlist(pub)}
                    onSetMapy={(position) => setMapyPub(index, position)}
                    onClearMapy={() => clearMapyPub(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <div className="add-pub-actions">
            <button type="button" onClick={() => setForm((current) => ({ ...current, pubs: [...current.pubs, newPub()] }))}>+ Přidat hospodu</button>
            <button type="button" className="wishlist" onClick={() => setShowWishlistPicker(true)}>⭐ Z wishlistu ({wishlist.length})</button>
          </div>
        </div>

        <div className="save-bar">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(isEdit ? `/events/${id}` : "/")}>Zrušit</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}><Icon name="check" size={16} /> {saving ? "Ukládám..." : isEdit ? "Uložit změny" : "Vytvořit akci"}</button>
        </div>
      </form>

      {showWishlistPicker && (
        <Modal onClose={() => setShowWishlistPicker(false)}>
          <h2>Přidat z wishlistu</h2>
          <p>Vyber hospodu, kterou chceš zahrnout do trasy.</p>
          {wishlist.length === 0 ? <div className="empty">Wishlist je prázdný.</div> : (
            <div className="picker-list">
              {wishlist.map((item) => {
                const already = form.pubs.some((pub) => pub.name.toLowerCase() === item.name.toLowerCase());
                return (
                  <button key={item._id} className="picker-item" onClick={() => !already && pickFromWishlist(item)} disabled={already}>
                    <strong>{item.name}</strong>{already && <span className="chip chip-grey">už v trase</span>}
                    {item.address && <span>{item.address}</span>}
                  </button>
                );
              })}
            </div>
          )}
          <div className="modal-actions"><button className="btn btn-ghost" onClick={() => setShowWishlistPicker(false)}>Zavřít</button></div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(false)}>
          <h2>Smazat akci?</h2>
          <p>Akce <b>{eventTitle(form)}</b> bude smazána.</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>Zrušit</button>
            <button className="btn btn-danger-filled" onClick={handleDelete}>Smazat</button>
          </div>
        </Modal>
      )}
    </main>
  );
}
