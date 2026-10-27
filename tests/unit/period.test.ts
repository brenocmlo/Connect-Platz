import { describe, it, expect } from "vitest";
import { resolvePeriod, dateOnlyFilter, inRange } from "@/app/api/dashboard/_lib/period";

// 31/03/2026 10:00 local — fim de mês para pegar viradas de janela
const NOW = new Date(2026, 2, 31, 10, 0, 0);
const utcDay = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);

describe("resolvePeriod — janelas de 7d/30d", () => {
  it.each([
    ["7d", utcDay(2026, 3, 25)],
    ["30d", utcDay(2026, 3, 2)],
  ] as const)("%s cobre exatamente N dias de calendário em colunas @db.Date", (key, firstDay) => {
    const { current } = resolvePeriod(key, NOW);
    const f = dateOnlyFilter(current)!;
    expect(f.gte.toISOString().slice(0, 10)).toBe(firstDay);
    expect(f.lte.toISOString().slice(0, 10)).toBe(utcDay(2026, 3, 31));
  });

  it.each(["7d", "30d"] as const)("%s: período anterior não se sobrepõe ao atual", (key) => {
    const { current, previous } = resolvePeriod(key, NOW);
    expect(previous!.end.getTime()).toBeLessThan(current!.start.getTime());
    expect(inRange(current!.start, previous)).toBe(false);
    expect(current!.start.getTime() - previous!.start.getTime()).toBe(current!.end.getTime() + 1 - current!.start.getTime());
  });
});
