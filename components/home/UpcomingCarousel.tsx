"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Match } from "@/lib/types";
import MatchCard from "./MatchCard";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&auto=format&fit=crop&q=80",
];

interface Props {
  matches: Match[];
}

export default function UpcomingCarousel({ matches }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Left button */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-bb-border shadow-card flex items-center justify-center text-bb-text-2 hover:text-bb-blue hover:border-bb-blue/30 transition-all"
        aria-label="Scroll left"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {matches.map((m, i) => (
          <div key={m.id} className="flex-none w-[300px]">
            <MatchCard match={m} bgImage={BG_IMAGES[i % BG_IMAGES.length]} />
          </div>
        ))}
      </div>

      {/* Right button */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-bb-border shadow-card flex items-center justify-center text-bb-text-2 hover:text-bb-blue hover:border-bb-blue/30 transition-all"
        aria-label="Scroll right"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
