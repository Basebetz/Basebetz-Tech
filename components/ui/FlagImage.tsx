"use client";
import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

export default function FlagImage({ src, alt, className = "w-10 h-7 object-cover rounded-sm", fallbackText }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-7 rounded-sm bg-bb-navy border border-bb-border text-[10px] font-mono font-bold text-bb-text-3">
        {(fallbackText ?? alt).slice(0, 3).toUpperCase()}
      </span>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}
