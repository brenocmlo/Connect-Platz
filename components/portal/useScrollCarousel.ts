"use client";

import { useCallback, useEffect, useState } from "react";

// Carrossel nativo com scroll-snap: setas rolam ~uma "página" e refletem os limites.
// Usa callback ref porque o trilho pode montar depois (ex.: após o loading).
export function useScrollCarousel<T extends HTMLElement = HTMLDivElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    if (!node) return;
    const prev = node.scrollLeft > 4;
    const next = node.scrollLeft + node.clientWidth < node.scrollWidth - 4;
    setCanPrev((v) => (v === prev ? v : prev));
    setCanNext((v) => (v === next ? v : next));
  }, [node]);

  useEffect(() => {
    if (!node) return;
    update();
    node.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => {
      node.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [node, update]);

  const scrollBy = (direction: 1 | -1) => {
    node?.scrollBy({ left: direction * node.clientWidth * 0.85, behavior: "smooth" });
  };

  return {
    ref: setNode,
    node,
    canPrev,
    canNext,
    update,
    prev: () => scrollBy(-1),
    next: () => scrollBy(1),
  };
}
