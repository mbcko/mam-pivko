import { useEffect, useState } from "react";

const MESSAGES = [
  "Čepuji...",
  "Probouzím výčepního...",
  "Leštím sklenice...",
  "Kladím podtácky...",
  "Chlazím piva...",
  "Česám chmel...",
  "Sestavuji pivní lístek...",
  "Hledám dno sudu...",
  "Otevírám šenk...",
  "Budím hospodského...",
  "Připravuji pivní trasu...",
  "Kontroluji teplotu sklenic...",
  "Nabírám pěnu...",
  "Vybírám správnou hospodu...",
  "Přepočítávám rundy...",
];

export default function LoadingMessage() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * MESSAGES.length));

  useEffect(() => {
    const tick = () => {
      setIndex((i) => {
        let next;
        do { next = Math.floor(Math.random() * MESSAGES.length); } while (next === i);
        return next;
      });
      schedule();
    };
    let timer;
    const schedule = () => { timer = setTimeout(tick, 1500 + Math.random() * 1500); };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  return <p>{MESSAGES[index]}</p>;
}
