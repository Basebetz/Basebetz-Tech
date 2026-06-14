"use client";
import { useEffect, useState } from "react";

interface CountdownTimerProps {
  target: string;
  className?: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer({ target, className }: CountdownTimerProps) {
  const [diff, setDiff] = useState(0);

  useEffect(() => {
    const update = () => {
      const ms = new Date(target).getTime() - Date.now();
      setDiff(Math.max(0, ms));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (diff <= 0) return <span className={className}>Started</span>;

  const s = Math.floor(diff / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return (
    <span className={className}>
      {h > 0 ? `${pad(h)}:` : ""}{pad(m)}:{pad(sec)}
    </span>
  );
}
