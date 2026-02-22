import { useEffect, useState } from "react";
import styles from "./EventPubMap.module.css";

const API_KEY = import.meta.env.VITE_MAPY_API_KEY;

async function geocodeAddress(query) {
  const url = `https://api.mapy.com/v1/geocode?query=${encodeURIComponent(query)}&lang=cs&limit=1&apikey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data.items?.[0]?.position ?? null;
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

export default function EventPubMap({ pubs }) {
  const [positions, setPositions] = useState(null);

  useEffect(() => {
    if (!API_KEY || pubs.length === 0) return;
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
    ).then(setPositions);
  }, [pubs]);

  if (!API_KEY || !positions) return null;
  if (!positions.some(Boolean)) return null;

  return (
    <div className={styles.mapWrapper}>
      <img
        src={buildMapUrl(positions)}
        alt="Mapa hospod"
        className={styles.map}
      />
    </div>
  );
}
