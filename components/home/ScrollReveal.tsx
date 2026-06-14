"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  className?: string;
  amount?: number;
  blur?: boolean;
}

export default function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className,
  amount = 0.15,
  blur = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount });

  const offsets = {
    up:    { y: 36, x: 0 },
    left:  { y: 0,  x: -28 },
    right: { y: 0,  x: 28 },
    none:  { y: 0,  x: 0 },
  }[direction];

  const initial = {
    opacity: 0,
    ...offsets,
    filter: blur ? "blur(6px)" : undefined,
  };

  const visible = {
    opacity: 1,
    y: 0,
    x: 0,
    filter: blur ? "blur(0px)" : undefined,
  };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? visible : initial}
      transition={{ duration: 0.58, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
