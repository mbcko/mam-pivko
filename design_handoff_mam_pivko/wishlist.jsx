// wishlist.jsx — Wishlist screen
// Exposes: window.WishlistScreen

function WishlistRow({ item, index, onEdit, onDelete, onLog, canEdit }) {
  return (
    <div className="wish-row">
      <div className="num">{index + 1}</div>
      <div className="info">
        <div className="name">
          {item.name}
          {!item.coords && (
            <span className="chip" style={{ background: 'transparent', color: 'var(--colorYellow-600)', padding: 0, gap: 2, fontSize: 11 }} title="Bez map dat">
              <window.Icon name="pin" size={12} />
            </span>
          )}
        </div>
        {item.address && <div className="addr">{item.address}</div>}
        <div className="meta">
          {item.visits > 0 ? (
            <span className="visits">🍻 {item.visits} {item.visits === 1 ? 'návštěva' : item.visits >= 2 && item.visits <= 4 ? 'návštěvy' : 'návštěv'}</span>
          ) : (
            <span className="last">Zatím nenavštíveno</span>
          )}
          {item.note && <span className="last" style={{ fontStyle: 'italic' }}>"{item.note}"</span>}
        </div>
      </div>
      <div className="actions">
        {item.mapyLabel && (
          <a
            className="icon-btn"
            href={`https://mapy.cz/zakladni?q=${encodeURIComponent(item.mapyLabel)}`}
            target="_blank"
            rel="noreferrer"
            title="Mapy.cz"
          >
            <window.Icon name="pin" size={16} />
          </a>
        )}
        {canEdit && (
          <React.Fragment>
            <button className="icon-btn" onClick={onEdit} title="Upravit"><window.Icon name="pencil" /></button>
            <button className="icon-btn danger" onClick={onDelete} title="Odebrat"><window.Icon name="trash" /></button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

function WishItemForm({ initial, onSave, onCancel }) {
  const [draft, setDraft] = React.useState(() => initial || {
    name: '', address: '', note: '', url: '', mapyLabel: '', coords: null, visits: 0
  });
  const ref = React.useRef(null);
  React.useEffect(() => { ref.current?.focus(); }, []);

  const fakeSearch = () => {
    if (draft.name) {
      setDraft({ ...draft, mapyLabel: `${draft.name}${draft.address ? ' – ' + draft.address : ''}`, coords: { lat: 50.08, lng: 14.43 } });
    }
  };

  return (
    <div className="card" style={{ marginBottom: 10, borderColor: 'var(--color-accent)' }}>
      <div className="field">
        <input
          ref={ref}
          className="input"
          placeholder="Název hospody *"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
      </div>
      <div className="field">
        <input
          className="input"
          placeholder="Adresa (volitelná)"
          value={draft.address}
          onChange={(e) => setDraft({ ...draft, address: e.target.value })}
        />
      </div>
      <div className="field">
        <input
          className="input"
          placeholder="Poznámka (volitelná)"
          value={draft.note}
          onChange={(e) => setDraft({ ...draft, note: e.target.value })}
        />
      </div>
      <div className="field">
        <input
          className="input"
          placeholder="Odkaz (volitelný)"
          value={draft.url}
          onChange={(e) => setDraft({ ...draft, url: e.target.value })}
        />
      </div>
      {draft.mapyLabel ? (
        <div className="mapy-suggest" style={{ marginBottom: 10 }}>
          <span>📍 {draft.mapyLabel}</span>
          <button className="x" onClick={() => setDraft({ ...draft, mapyLabel: '', coords: null })}>×</button>
        </div>
      ) : (
        <div className="row" style={{ marginBottom: 10 }}>
          <input
            className="input input-search"
            placeholder="Vyhledat na Mapy.cz..."
            onKeyDown={(e) => { if (e.key === 'Enter') fakeSearch(); }}
          />
          <button className="btn btn-ghost btn-sm" onClick={fakeSearch}>Najít</button>
        </div>
      )}
      <div className="row">
        <button className="btn btn-primary" onClick={() => draft.name.trim() && onSave(draft)}>
          <window.Icon name="check" size={14} /> Uložit
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>Zrušit</button>
      </div>
    </div>
  );
}

function WishlistScreen({ state, onRoute, tweaks }) {
  const { wishlist, setWishlist, auth, events } = state;
  const [editing, setEditing] = React.useState(null); // id of item being edited, or 'new'
  const [confirmDel, setConfirmDel] = React.useState(null);

  // sort: with map data first, then alpha
  const sorted = React.useMemo(() => {
    return [...wishlist].sort((a, b) => {
      const am = !!a.coords ? 0 : 1;
      const bm = !!b.coords ? 0 : 1;
      if (am !== bm) return am - bm;
      return a.name.localeCompare(b.name, 'cs');
    });
  }, [wishlist]);

  const pins = sorted.filter(w => w.coords).map(w => ({ label: w.name }));

  // Top of the list: hot picks (most visits)
  const hot = [...wishlist].filter(w => w.visits >= 1).sort((a, b) => b.visits - a.visits)[0];

  const handleSave = (draft) => {
    if (editing === 'new') {
      setWishlist([...wishlist, { ...draft, id: window.uid() }]);
    } else {
      setWishlist(wishlist.map(w => w.id === editing ? { ...draft, id: editing } : w));
    }
    setEditing(null);
  };

  const handleDelete = (id) => {
    setWishlist(wishlist.filter(w => w.id !== id));
    setConfirmDel(null);
  };

  return (
    <div className="shell fade-in">
      <window.BackLink onClick={() => onRoute('/')} />

      <div className="form-title-row">
        <h1>
          <span style={{ marginRight: 6 }}>⭐</span>
          Wishlist hospod
        </h1>
        {auth.loggedIn && editing !== 'new' && (
          <button className="btn btn-primary" onClick={() => setEditing('new')}>
            <window.Icon name="plus" size={14} /> Přidat hospodu
          </button>
        )}
      </div>

      {wishlist.length > 0 && (
        <window.MapPlaceholder pins={pins.length ? pins : [{ label: '?', x: 0.5, y: 0.5 }]} size="compact" />
      )}

      {hot && (
        <div style={{ background: 'var(--colorGreen-100)', color: 'var(--colorGreen-600)', padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>🏆</span>
          <span>Nejnavštěvovanější: <b>{hot.name}</b> · {hot.visits}× pivko</span>
        </div>
      )}

      {editing === 'new' && (
        <WishItemForm onSave={handleSave} onCancel={() => setEditing(null)} />
      )}

      {wishlist.length === 0 ? (
        <div className="empty">
          <div className="ico">⭐</div>
          <div className="em-title">Wishlist je prázdný</div>
          <div>Přidej hospodu, na kterou by ses chtěl vrátit nebo nově vyrazit.</div>
        </div>
      ) : (
        <div className="wishlist-grid">
          {sorted.map((item, i) => (
            editing === item.id ? (
              <div key={item.id} style={{ gridColumn: '1 / -1' }}>
                <WishItemForm
                  initial={item}
                  onSave={handleSave}
                  onCancel={() => setEditing(null)}
                />
              </div>
            ) : (
              <WishlistRow
                key={item.id}
                item={item}
                index={i}
                onEdit={() => setEditing(item.id)}
                onDelete={() => setConfirmDel(item.id)}
                canEdit={auth.loggedIn}
              />
            )
          ))}
        </div>
      )}

      {confirmDel && (
        <window.Modal onClose={() => setConfirmDel(null)}>
          <h2>Odebrat z wishlistu?</h2>
          <p><b>{wishlist.find(w => w.id === confirmDel)?.name}</b> bude odebrán z wishlistu.</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Zrušit</button>
            <button className="btn btn-danger-filled" onClick={() => handleDelete(confirmDel)}>Odebrat</button>
          </div>
        </window.Modal>
      )}
    </div>
  );
}

Object.assign(window, { WishlistScreen });
