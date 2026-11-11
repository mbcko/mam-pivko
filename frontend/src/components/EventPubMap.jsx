import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "leaflet/dist/leaflet.css";
import styles from "./EventPubMap.module.css";

const API_KEY = import.meta.env.VITE_MAPY_API_KEY;
const MAX_ROUTE_STOPS = 17;

async function geocodeAddress(query) {
  try {
    const url = `https://api.mapy.com/v1/geocode?query=${encodeURIComponent(query)}&lang=cs&limit=1&apikey=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.items?.[0]?.position ?? null;
  } catch {
    return null;
  }
}

function buildMapUrl(positions) {
  const url = new URL("https://api.mapy.com/v1/static/map");
  url.searchParams.set("width", "680");
  url.searchParams.set("height", "300");
  url.searchParams.set("mapset", "basic");
  url.searchParams.set("apikey", API_KEY);
  positions.forEach((pos, i) => {
    if (!pos) return;
    url.searchParams.append(
      "markers",
      `color:red;size:normal;label:${i + 1};${pos.lon},${pos.lat}`
    );
  });
  return url.toString();
}

function buildPlaceUrl(position) {
  const url = new URL("https://mapy.com/fnc/v1/showmap");
  url.searchParams.set("mapset", "basic");
  url.searchParams.set("center", `${position.lon},${position.lat}`);
  url.searchParams.set("zoom", "17");
  url.searchParams.set("marker", "true");
  return url.toString();
}

function buildRouteUrl(positions) {
  const stops = positions.filter(Boolean);
  if (stops.length === 0 || stops.length > MAX_ROUTE_STOPS) return null;
  if (stops.length === 1) return buildPlaceUrl(stops[0]);

  const url = new URL("https://mapy.com/fnc/v1/route");
  url.searchParams.set("mapset", "basic");
  url.searchParams.set("routeType", "foot_fast");
  url.searchParams.set("start", `${stops[0].lon},${stops[0].lat}`);
  url.searchParams.set("end", `${stops.at(-1).lon},${stops.at(-1).lat}`);
  if (stops.length > 2) {
    url.searchParams.set(
      "waypoints",
      stops.slice(1, -1).map((stop) => `${stop.lon},${stop.lat}`).join(";")
    );
  }
  return url.toString();
}

function formatStopCount(count) {
  if (count === 1) return "1 zastávka";
  if (count >= 2 && count <= 4) return `${count} zastávky`;
  return `${count} zastávek`;
}

function createPopupContent(pub, position) {
  const popup = document.createElement("div");
  popup.className = styles.popup;

  const name = document.createElement("strong");
  name.textContent = pub.name || "Hospoda";
  popup.append(name);

  if (pub.address) {
    const address = document.createElement("span");
    address.textContent = pub.address;
    popup.append(address);
  }

  const link = document.createElement("a");
  link.href = buildPlaceUrl(position);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Otevřít v Mapy.com";
  popup.append(link);

  return popup;
}

function InteractiveMap({ positions, pubs }) {
  const mapElement = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    let map;

    import("leaflet")
      .then((leafletModule) => {
        if (cancelled || !mapElement.current) return;

        const L = leafletModule.default ?? leafletModule;
        map = L.map(mapElement.current, {
          zoomControl: true,
          attributionControl: true,
        });

        L.tileLayer(
          `https://api.mapy.com/v1/maptiles/basic/256/{z}/{x}/{y}?apikey=${API_KEY}`,
          {
            minZoom: 0,
            maxZoom: 20,
            attribution: '<a href="https://api.mapy.com/copyright" target="_blank" rel="noopener">&copy; Seznam.cz a.s. a další</a>',
          }
        ).addTo(map);

        const bounds = [];
        positions.forEach((position, index) => {
          if (!position) return;

          const latLng = [position.lat, position.lon];
          bounds.push(latLng);
          L.marker(latLng, {
            title: pubs[index]?.name || `Zastávka ${index + 1}`,
            icon: L.divIcon({
              className: styles.markerIcon,
              html: `<span><b>${index + 1}</b></span>`,
              iconSize: [42, 50],
              iconAnchor: [21, 50],
              popupAnchor: [0, -46],
            }),
          })
            .addTo(map)
            .bindPopup(createPopupContent(pubs[index] || {}, position), {
              closeButton: true,
              minWidth: 190,
            });
        });

        if (bounds.length === 1) {
          map.setView(bounds[0], 16);
        } else {
          map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
        }

        const LogoControl = L.Control.extend({
          options: { position: "bottomleft" },
          onAdd() {
            const container = L.DomUtil.create("div", styles.logoControl);
            const link = L.DomUtil.create("a", "", container);
            const logo = L.DomUtil.create("img", "", link);
            link.href = "https://mapy.com/";
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.setAttribute("aria-label", "Mapy.com");
            logo.src = "https://api.mapy.com/img/api/logo.svg";
            logo.alt = "Mapy.com";
            L.DomEvent.disableClickPropagation(link);
            return container;
          },
        });
        new LogoControl().addTo(map);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [positions, pubs]);

  return (
    <div className={styles.interactiveMapWrap}>
      <div ref={mapElement} className={styles.interactiveMap} aria-label="Interaktivní mapa hospod" />
      {status === "loading" && <div className={styles.mapStatus}>Načítám mapu…</div>}
      {status === "error" && <div className={styles.mapStatus}>Mapu se nepodařilo načíst.</div>}
    </div>
  );
}

function RouteMapDialog({ positions, pubs, onClose }) {
  const closeButton = useRef(null);
  const routeUrl = useMemo(() => buildRouteUrl(positions), [positions]);
  const stopCount = positions.filter(Boolean).length;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.dialogBackdrop} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="route-map-title">
        <header className={styles.dialogHeader}>
          <div>
            <h2 id="route-map-title">Mapa trasy</h2>
            <span>{formatStopCount(stopCount)}</span>
          </div>
          <button ref={closeButton} type="button" className={styles.closeButton} onClick={onClose} aria-label="Zavřít mapu">
            ×
          </button>
        </header>
        <InteractiveMap positions={positions} pubs={pubs} />
        {routeUrl && (
          <footer className={styles.dialogFooter}>
            <a className={styles.routeButton} href={routeUrl} target="_blank" rel="noopener noreferrer">
              {stopCount === 1 ? "Otevřít v Mapy.com" : "Otevřít pěší trasu v Mapy.com"}
            </a>
          </footer>
        )}
      </section>
    </div>,
    document.body
  );
}

export default function EventPubMap({ pubs, interactive = false }) {
  const [positions, setPositions] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const previewButton = useRef(null);

  function closeDialog() {
    setDialogOpen(false);
    window.requestAnimationFrame(() => previewButton.current?.focus());
  }

  useEffect(() => {
    if (!API_KEY || pubs.length === 0) return undefined;
    let cancelled = false;

    Promise.all(
      pubs.map((pub) => {
        if (pub.mapy_lon != null && pub.mapy_lat != null) {
          return Promise.resolve({ lon: pub.mapy_lon, lat: pub.mapy_lat });
        }
        if (pub.address) {
          return geocodeAddress(`${pub.name}, ${pub.address}`);
        }
        return Promise.resolve(null);
      })
    ).then((resolvedPositions) => {
      if (!cancelled) setPositions(resolvedPositions);
    });

    return () => {
      cancelled = true;
    };
  }, [pubs]);

  if (!API_KEY || !positions) return null;
  if (!positions.some(Boolean)) return null;

  const mapImage = (
    <img
      src={buildMapUrl(positions)}
      alt="Mapa hospod"
      className={styles.map}
    />
  );

  return (
    <>
      <div className={styles.mapWrapper}>
        {interactive ? (
          <button ref={previewButton} type="button" className={styles.previewButton} onClick={() => setDialogOpen(true)}>
            {mapImage}
            <span className={styles.previewLabel}>Prozkoumat mapu</span>
          </button>
        ) : mapImage}
      </div>
      {interactive && dialogOpen && (
        <RouteMapDialog positions={positions} pubs={pubs} onClose={closeDialog} />
      )}
    </>
  );
}
