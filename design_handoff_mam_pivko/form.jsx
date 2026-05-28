// form.jsx — Create / edit event form
// Exposes: window.FormScreen

function PubFormRow({
  pub, index, total, onChange, onRemove, onToggleWishlist, isInWishlist,
  dragHandlers, isDragging, isDragOver,
}) {
  return (
    <div className={`pub-row ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}>
      <div className="handle" {...dragHandlers} title="Přesunout">
        <window.Icon name="drag" size={16} />
      </div>
      <div className="num-badge">{index + 1}</div>
      <div className="fields">
        <input
          className="input"
          placeholder="Název hospody *"
          value={pub.name}
          onChange={(e) => onChange({ ...pub, name: e.target.value })}
        />
        <input
          className="input"
          placeholder="Adresa (volitelná)"
          value={pub.address || ''}
          onChange={(e) => onChange({ ...pub, address: e.target.value })}
        />
        <input
          className="input"
          placeholder="Poznámka (volitelná, např. 'tady jíme')"
          value={pub.note || ''}
          onChange={(e) => onChange({ ...pub, note: e.target.value })}
        />
        <input
          className="input"
          placeholder="Odkaz (volitelný, např. na menu)"
          value={pub.url || ''}
          onChange={(e) => onChange({ ...pub, url: e.target.value })}
        />
        {pub.mapyLabel ? (
          <div className="mapy-suggest">
            <span>📍 {pub.mapyLabel}</span>
            <button
              className="x"
              onClick={() => onChange({ ...pub, mapyLabel: '', coords: null })}
              title="Odebrat Mapy.cz lokaci"
            >×</button>
          </div>
        ) : (
          <input
            className="input input-search"
            placeholder="Vyhledat na Mapy.cz..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value) {
                onChange({ ...pub, mapyLabel: `${e.target.value} – z Mapy.cz`, coords: { lat: 50.08, lng: 14.43 } });
                e.target.value = '';
              }
            }}
          />
        )}
      </div>
      <div className="actions">
        <button
          className={`wishlist-toggle ${isInWishlist ? 'on' : ''}`}
          onClick={onToggleWishlist}
          title={isInWishlist ? 'V wishlistu' : 'Přidat do wishlistu'}
        >
          <window.Icon name={isInWishlist ? 'star-fill' : 'star'} size={16} />
        </button>
        <button className="icon-btn danger" onClick={onRemove} title="Odebrat">
          <window.Icon name="x" />
        </button>
      </div>
    </div>
  );
}

function FormScreen({ state, eventId, onRoute }) {
  const { events, setEvents, wishlist, setWishlist, ORGANIZERS, auth } = state;
  const isEdit = !!eventId;
  const existing = isEdit ? events.find(e => e.id === eventId) : null;

  const [form, setForm] = React.useState(() => {
    if (existing) return { ...existing, pubs: existing.pubs.map(p => ({ ...p })) };
    return {
      id: window.uid(),
      name: '',
      date: new Date().toISOString().slice(0, 10),
      organizer: auth.name && ORGANIZERS.includes(auth.name) ? auth.name : ORGANIZERS[0],
      notes: '',
      pubs: [],
    };
  });
  const [errors, setErrors] = React.useState({});
  const [confirmDel, setConfirmDel] = React.useState(false);
  const [showWishlistPicker, setShowWishlistPicker] = React.useState(false);

  // drag state
  const [dragIdx, setDragIdx] = React.useState(null);
  const [overIdx, setOverIdx] = React.useState(null);

  const setField = (k, v) => setForm({ ...form, [k]: v });

  const addPub = () => {
    setForm({
      ...form,
      pubs: [...form.pubs, { id: window.uid(), name: '', address: '', note: '', url: '', mapyLabel: '' }]
    });
  };

  const updatePub = (idx, pub) => {
    const next = [...form.pubs];
    next[idx] = pub;
    setForm({ ...form, pubs: next });
  };
  const removePub = (idx) => {
    setForm({ ...form, pubs: form.pubs.filter((_, i) => i !== idx) });
  };

  const movePub = (from, to) => {
    if (from === to || from == null || to == null) return;
    const next = [...form.pubs];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setForm({ ...form, pubs: next });
  };

  // drag handlers (HTML5 drag-and-drop)
  const makeDragHandlers = (idx) => ({
    draggable: true,
    onDragStart: (e) => {
      setDragIdx(idx);
      e.dataTransfer.effectAllowed = 'move';
      // need to set data for Firefox
      try { e.dataTransfer.setData('text/plain', String(idx)); } catch {}
    },
    onDragEnd: () => { setDragIdx(null); setOverIdx(null); },
  });
  const rowDragOverHandlers = (idx) => ({
    onDragOver: (e) => { e.preventDefault(); setOverIdx(idx); },
    onDragLeave: () => { if (overIdx === idx) setOverIdx(null); },
    onDrop: (e) => {
      e.preventDefault();
      if (dragIdx != null) movePub(dragIdx, idx);
      setDragIdx(null); setOverIdx(null);
    }
  });

  const toggleWishlistFor = (pub) => {
    const existsId = wishlist.find(w => w.name.toLowerCase() === (pub.name || '').toLowerCase())?.id;
    if (existsId) {
      setWishlist(wishlist.filter(w => w.id !== existsId));
    } else if (pub.name) {
      setWishlist([
        ...wishlist,
        {
          id: window.uid(),
          name: pub.name,
          address: pub.address || '',
          note: pub.note || '',
          url: pub.url || '',
          coords: pub.coords || null,
          mapyLabel: pub.mapyLabel || '',
          visits: 0,
        }
      ]);
    }
  };

  const isInWishlist = (pub) =>
    pub.name && wishlist.some(w => w.name.toLowerCase() === pub.name.toLowerCase());

  const addFromWishlist = (item) => {
    setForm({
      ...form,
      pubs: [...form.pubs, {
        id: window.uid(),
        name: item.name,
        address: item.address || '',
        note: '',
        url: item.url || '',
        mapyLabel: item.mapyLabel || '',
        coords: item.coords || null,
      }]
    });
    setShowWishlistPicker(false);
  };

  const handleSave = () => {
    const errs = {};
    if (!form.date) errs.date = 'Zadej datum';
    if (!form.organizer) errs.organizer = 'Vyber organizátora';
    if (form.pubs.some(p => !p.name.trim())) errs.pubs = 'Některá hospoda nemá název';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (isEdit) {
      setEvents(events.map(e => e.id === form.id ? form : e));
    } else {
      setEvents([...events, form]);
    }
    onRoute(`/events/${form.id}`);
  };

  const handleDelete = () => {
    setEvents(events.filter(e => e.id !== form.id));
    setConfirmDel(false);
    onRoute('/');
  };

  return (
    <div className="shell fade-in">
      <window.BackLink onClick={() => onRoute(isEdit ? `/events/${eventId}` : '/')} />

      <div className="form-title-row">
        <h1>{isEdit ? 'Upravit akci' : 'Nová akce'}</h1>
        {isEdit && (
          <button className="btn btn-sm btn-danger" onClick={() => setConfirmDel(true)}>
            <window.Icon name="trash" size={14} /> Smazat
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="field">
          <label className="field-label">Datum<span className="req">*</span></label>
          <input
            type="date"
            className="input"
            value={form.date}
            onChange={(e) => setField('date', e.target.value)}
          />
          {errors.date && <div className="field-error">{errors.date}</div>}
        </div>

        <div className="field">
          <label className="field-label">Organizátor<span className="req">*</span></label>
          <select
            className="select"
            value={form.organizer}
            onChange={(e) => setField('organizer', e.target.value)}
          >
            {ORGANIZERS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="field">
          <label className="field-label">Název (volitelný)</label>
          <input
            className="input"
            placeholder={`Výchozí: MAM Pivko — ${form.organizer}`}
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
          />
        </div>

        <div className="field" style={{ marginBottom: 0 }}>
          <label className="field-label">Poznámky k večeru</label>
          <textarea
            className="textarea"
            placeholder="Téma, lokalita, sraz, cokoli..."
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="row between" style={{ marginBottom: 8 }}>
          <div className="row">
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Hospody</h3>
            <span className="chip chip-grey">{form.pubs.length}</span>
          </div>
          {form.pubs.length > 0 && (
            <span className="muted" style={{ fontSize: 12 }}>táhni ⋮⋮ pro přeskupení</span>
          )}
        </div>

        {form.pubs.length === 0 ? (
          <div className="empty" style={{ marginTop: 8 }}>
            <div className="ico">🗺️</div>
            <div className="em-title">Žádné hospody</div>
            <div>Přidej první stop tlačítkem níže.</div>
          </div>
        ) : (
          <div className="pubs-list">
            {form.pubs.map((pub, i) => (
              <div key={pub.id} {...rowDragOverHandlers(i)}>
                <PubFormRow
                  pub={pub}
                  index={i}
                  total={form.pubs.length}
                  onChange={(p) => updatePub(i, p)}
                  onRemove={() => removePub(i)}
                  onToggleWishlist={() => toggleWishlistFor(pub)}
                  isInWishlist={isInWishlist(pub)}
                  dragHandlers={makeDragHandlers(i)}
                  isDragging={dragIdx === i}
                  isDragOver={overIdx === i && dragIdx !== i}
                />
              </div>
            ))}
          </div>
        )}

        {errors.pubs && <div className="field-error" style={{ marginTop: 6 }}>{errors.pubs}</div>}

        <div className="add-pub-actions">
          <button onClick={addPub}>
            + Přidat hospodu
          </button>
          <button className="wishlist" onClick={() => setShowWishlistPicker(true)}>
            ⭐ Z wishlistu ({wishlist.length})
          </button>
        </div>
      </div>

      <div className="save-bar">
        <button className="btn btn-ghost" onClick={() => onRoute(isEdit ? `/events/${eventId}` : '/')}>Zrušit</button>
        <button className="btn btn-primary btn-lg" onClick={handleSave}>
          <window.Icon name="check" size={16} />
          {isEdit ? 'Uložit změny' : 'Vytvořit akci'}
        </button>
      </div>

      {showWishlistPicker && (
        <window.Modal onClose={() => setShowWishlistPicker(false)}>
          <h2>Přidat z wishlistu</h2>
          <p>Vyber hospodu, kterou chceš zahrnout do trasy.</p>
          {wishlist.length === 0 ? (
            <div className="empty">Wishlist je prázdný.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflow: 'auto', margin: '0 -4px' }}>
              {wishlist.map(w => {
                const already = form.pubs.some(p => p.name.toLowerCase() === w.name.toLowerCase());
                return (
                  <button
                    key={w.id}
                    onClick={() => !already && addFromWishlist(w)}
                    disabled={already}
                    style={{
                      textAlign: 'left',
                      background: already ? 'var(--colorGrey-100)' : 'white',
                      border: '1px solid var(--pub-line)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      cursor: already ? 'default' : 'pointer',
                      fontFamily: 'inherit',
                      opacity: already ? 0.6 : 1,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{w.name} {already && <span className="chip chip-grey" style={{ marginLeft: 6 }}>už v trase</span>}</div>
                    {w.address && <div style={{ fontSize: 12, color: 'var(--pub-mute)', marginTop: 2 }}>{w.address}</div>}
                  </button>
                );
              })}
            </div>
          )}
          <div className="modal-actions" style={{ marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={() => setShowWishlistPicker(false)}>Zavřít</button>
          </div>
        </window.Modal>
      )}

      {confirmDel && (
        <window.Modal onClose={() => setConfirmDel(false)}>
          <h2>Smazat akci?</h2>
          <p>Akce <b>{window.eventTitle(form)}</b> bude smazána.</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setConfirmDel(false)}>Zrušit</button>
            <button className="btn btn-danger-filled" onClick={handleDelete}>Smazat</button>
          </div>
        </window.Modal>
      )}
    </div>
  );
}

Object.assign(window, { FormScreen });
