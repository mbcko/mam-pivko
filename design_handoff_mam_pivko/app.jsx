// app.jsx — router + tweaks + mount

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "pastVisibility": "equal",
  "routeStyle": "timeline",
  "density": "comfortable"
}/*EDITMODE-END*/;

function parseRoute(hash) {
  const h = (hash || '').replace(/^#/, '');
  if (!h || h === '/') return { name: 'list' };
  if (h === '/wishlist') return { name: 'wishlist' };
  if (h === '/new') return { name: 'form', id: null };
  const editMatch = h.match(/^\/events\/([^/]+)\/edit$/);
  if (editMatch) return { name: 'form', id: editMatch[1] };
  const detailMatch = h.match(/^\/events\/([^/]+)$/);
  if (detailMatch) return { name: 'detail', id: detailMatch[1] };
  return { name: 'list' };
}

function App() {
  const state = window.useAppState();
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const [hash, setHash] = React.useState(window.location.hash);
  const [logoutModal, setLogoutModal] = React.useState(false);

  React.useEffect(() => {
    const onHash = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Apply density to body
  React.useEffect(() => {
    document.body.setAttribute('data-density', tweaks.density);
  }, [tweaks.density]);

  const route = parseRoute(hash);
  const goto = (path) => {
    window.location.hash = path;
  };

  const handleLogin = () => state.setAuth({ loggedIn: true, name: 'mbcko', email: 'mbcko@heureka.cz' });
  const handleLogoutConfirmed = () => { state.setAuth({ loggedIn: false, name: '', email: '' }); setLogoutModal(false); };

  // gate: form requires auth
  if ((route.name === 'form') && !state.auth.loggedIn) {
    return (
      <div className="app">
        <window.Appbar
          auth={state.auth}
          onLogin={handleLogin}
          onLogout={() => setLogoutModal(true)}
          route={route.name === 'form' ? '/new' : '/'}
          onRoute={goto}
          wishlistCount={state.wishlist.length}
        />
        <div className="login-page">
          <div className="login-card">
            <div className="big-mug">🔒🍺</div>
            <h1>Pouze pro členy<span className="bang">!</span></h1>
            <p className="lead">Pro vytváření a úpravy akcí se musíš přihlásit.</p>
            <button className="google-btn" onClick={handleLogin}>
              <window.GoogleIcon /> Přihlásit se přes Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <window.Appbar
        auth={state.auth}
        onLogin={handleLogin}
        onLogout={() => setLogoutModal(true)}
        route={hash.replace(/^#/, '') || '/'}
        onRoute={goto}
        wishlistCount={state.wishlist.length}
      />
      {route.name === 'list' && (
        <window.ListScreen state={state} onRoute={goto} tweaks={tweaks} />
      )}
      {route.name === 'detail' && (
        <window.DetailScreen state={state} eventId={route.id} onRoute={goto} tweaks={tweaks} />
      )}
      {route.name === 'form' && (
        <window.FormScreen state={state} eventId={route.id} onRoute={goto} />
      )}
      {route.name === 'wishlist' && (
        <window.WishlistScreen state={state} onRoute={goto} tweaks={tweaks} />
      )}

      {logoutModal && (
        <window.Modal onClose={() => setLogoutModal(false)}>
          <h2>Odhlásit se?</h2>
          <p>Budeš procházet jako host, vytváření a úpravy budou zamčené.</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setLogoutModal(false)}>Zrušit</button>
            <button className="btn btn-danger-filled" onClick={handleLogoutConfirmed}>Odhlásit</button>
          </div>
        </window.Modal>
      )}

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Zobrazení" />
        <window.TweakRadio
          label="Minulé akce"
          value={tweaks.pastVisibility}
          options={[
            { value: 'equal', label: 'Stejně' },
            { value: 'faded', label: 'Vybledlé' },
            { value: 'hidden', label: 'Skrýt' },
          ]}
          onChange={(v) => setTweak('pastVisibility', v)}
        />
        <window.TweakRadio
          label="Styl trasy"
          value={tweaks.routeStyle}
          options={[
            { value: 'timeline', label: 'Timeline' },
            { value: 'cards', label: 'Karty' },
            { value: 'map', label: 'Mapa nahoře' },
          ]}
          onChange={(v) => setTweak('routeStyle', v)}
        />
        <window.TweakRadio
          label="Hustota karet"
          value={tweaks.density}
          options={[
            { value: 'comfortable', label: 'Vzdušné' },
            { value: 'compact', label: 'Husté' },
          ]}
          onChange={(v) => setTweak('density', v)}
        />
        <window.TweakSection label="Demo" />
        <window.TweakButton
          label="Resetovat data"
          onClick={() => {
            state.resetAll();
          }}
        />
        <window.TweakButton
          label={state.auth.loggedIn ? 'Odhlásit (host režim)' : 'Přihlásit'}
          onClick={() => {
            if (state.auth.loggedIn) state.setAuth({ loggedIn: false, name: '', email: '' });
            else handleLogin();
          }}
        />
      </window.TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
