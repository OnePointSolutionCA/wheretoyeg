"use client";

import { useRef, useCallback } from "react";

export function Card3D({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;
    const rect = wrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      inner.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateZ(6px)`;
    });
  }, []);

  const onLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const inner = innerRef.current;
    if (!inner) return;
    inner.style.transform = "";
  }, []);

  return (
    <div
      ref={wrapRef}
      className={"card-3d " + className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ perspective: "1000px" }}
    >
      <div ref={innerRef} className="card-3d-inner" style={{ transformStyle: "preserve-3d", transition: "transform 200ms ease-out", pointerEvents: "auto" }}>
        {children}
      </div>
    </div>
  );
}
