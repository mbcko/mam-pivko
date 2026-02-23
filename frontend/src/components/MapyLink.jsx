export default function MapyLink({ lon, lat, name, address, className }) {
  if (lon != null) {
    return (
      <a
        href={`https://mapy.cz/zakladni?x=${lon}&y=${lat}&z=17`}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        📍 Mapy.cz
      </a>
    );
  }
  if (name || address) {
    return (
      <a
        href={`https://mapy.cz/zakladni?q=${encodeURIComponent([name, address].filter(Boolean).join(", "))}`}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        📍 Mapy.cz
      </a>
    );
  }
  return null;
}
