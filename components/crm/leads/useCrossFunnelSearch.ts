"use client";

// components/crm/leads/useCrossFunnelSearch.ts
// Busca paralela e leve de leads em outros funis da organização quando o usuário digita na busca.

import { useEffect, useRef, useState } from "react";
import { OtherFunnelMatch, fetchLeads } from "./leadsApi";

export function useCrossFunnelSearch(funnelId: string | null, searchQuery: string) {
  const [matches, setMatches] = useState<OtherFunnelMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const activeQueryRef = useRef("");

  useEffect(() => {
    const clean = searchQuery.trim();
    if (!funnelId || clean.length < 2) {
      setMatches([]);
      setIsSearching(false);
      return;
    }

    activeQueryRef.current = clean;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetchLeads(funnelId, clean);
        if (activeQueryRef.current === clean) {
          setMatches(res.otherFunnelMatches || []);
        }
      } catch {
        if (activeQueryRef.current === clean) {
          setMatches([]);
        }
      } finally {
        if (activeQueryRef.current === clean) {
          setIsSearching(false);
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [funnelId, searchQuery]);

  const clearMatches = () => setMatches([]);

  return { matches, isSearching, clearMatches };
}
