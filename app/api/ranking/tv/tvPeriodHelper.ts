// app/api/ranking/tv/tvPeriodHelper.ts
// Resolução das 5 semanas do mês e intervalos de datas para o Modo TV.

import type { TvPeriodKey } from "@/components/crm/ranking/tv/types";

export interface TvDateRange {
  start: Date;
  end: Date;
}

export interface TvResolvedPeriod {
  key: TvPeriodKey;
  label: string;
  semanaNumero: number;
  semanaRange: TvDateRange;
  mesRange: TvDateRange;
  hojeRange: TvDateRange;
}

export function getCurrentWeekNumber(now: Date = new Date()): number {
  const day = now.getDate();
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  if (day <= 28) return 4;
  return 5;
}

export function resolveTvPeriod(rawKey?: string | null, now: Date = new Date()): TvResolvedPeriod {
  const year = now.getFullYear();
  const month = now.getMonth();
  const currentWeek = getCurrentWeekNumber(now);

  const defaultKey: TvPeriodKey = (`sem_${currentWeek}` as TvPeriodKey);
  const key: TvPeriodKey = (rawKey === "mes" || (rawKey && rawKey.startsWith("sem_")))
    ? (rawKey as TvPeriodKey)
    : defaultKey;

  // Início e fim do mês
  const mesStart = new Date(year, month, 1, 0, 0, 0, 0);
  const mesEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // Início e fim de hoje
  const hojeStart = new Date(year, month, now.getDate(), 0, 0, 0, 0);
  const hojeEnd = new Date(year, month, now.getDate(), 23, 59, 59, 999);

  let semanaNumero = currentWeek;
  let semStartDay = 1;
  let semEndDay = 7;

  if (key === "sem_1") {
    semanaNumero = 1;
    semStartDay = 1;
    semEndDay = 7;
  } else if (key === "sem_2") {
    semanaNumero = 2;
    semStartDay = 8;
    semEndDay = 14;
  } else if (key === "sem_3") {
    semanaNumero = 3;
    semStartDay = 15;
    semEndDay = 21;
  } else if (key === "sem_4") {
    semanaNumero = 4;
    semStartDay = 22;
    semEndDay = 28;
  } else if (key === "sem_5") {
    semanaNumero = 5;
    semStartDay = 29;
    semEndDay = mesEnd.getDate();
  } else {
    // mes completo
    semanaNumero = currentWeek;
    semStartDay = 1;
    semEndDay = mesEnd.getDate();
  }

  const semStart = new Date(year, month, semStartDay, 0, 0, 0, 0);
  const semEnd = new Date(year, month, Math.min(semEndDay, mesEnd.getDate()), 23, 59, 59, 999);

  const label = key === "mes" ? "Mês Atual" : `${semanaNumero}ª SEM`;

  return {
    key,
    label,
    semanaNumero,
    semanaRange: { start: semStart, end: semEnd },
    mesRange: { start: mesStart, end: mesEnd },
    hojeRange: { start: hojeStart, end: hojeEnd },
  };
}
