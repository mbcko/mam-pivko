import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import styles from "./EventForm.module.css";

const EMPTY_PUB = { name: "", address: "", notes: "" };

const EMPTY_EVENT = {
  name: "",
  date: "",
  organizer: "",
  pubs: [{ ...EMPTY_PUB }],
  notes: "",
};

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_EVENT);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    api
      .getEvent(id)
      .then((event) => {
        setForm({
          name: event.name ?? "",
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

  function setPub(index, field, value) {
    setForm((f) => {
      const pubs = f.pubs.map((p, i) => (i === index ? { ...p, [field]: value } : p));
      return { ...f, pubs };
    });
  }

  function addPub() {
    setForm((f) => ({ ...f, pubs: [...f.pubs, { ...EMPTY_PUB }] }));
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

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
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
          Název akce (volitelný)
          <input
            type="text"
            placeholder="např. MAM Pivko #42"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </label>

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
          <input
            type="text"
            required
            placeholder="Kdo plánuje večer"
            value={form.organizer}
            onChange={(e) => setField("organizer", e.target.value)}
          />
        </label>

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
              </div>
              <div className={styles.pubControls}>
                <button type="button" onClick={() => movePub(i, -1)} disabled={i === 0} title="Nahoru">↑</button>
                <button type="button" onClick={() => movePub(i, 1)} disabled={i === form.pubs.length - 1} title="Dolů">↓</button>
                <button type="button" onClick={() => removePub(i)} disabled={form.pubs.length === 1} title="Odebrat">✕</button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addPub} className={styles.addPub}>
            + Přidat hospodu
          </button>
        </fieldset>

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
