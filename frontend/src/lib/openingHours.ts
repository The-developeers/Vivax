export interface OpenStatus {
  isOpen: boolean;
  label: string;
  hoursLabel: string;
}

function formatHour(hour: number, minute: number): string {
  return minute === 0 ? `${hour}h` : `${hour}h${String(minute).padStart(2, "0")}`;
}

/**
 * Extrai "HH:MM" — "HH:MM" de um texto livre (ex: "18:00h — 00:00h") e
 * calcula se o local está aberto agora, lidando com horários que cruzam
 * a meia-noite (ex: bar que fecha às 00:00 ou 02:00).
 */
export function getOpenStatus(
  openingHours: string | null | undefined,
  now: Date = new Date()
): OpenStatus | null {
  if (!openingHours) return null;

  const matches = [...openingHours.matchAll(/(\d{1,2}):(\d{2})/g)];
  if (matches.length < 2) return null;

  const startH = Number(matches[0][1]);
  const startM = Number(matches[0][2]);
  const endH = Number(matches[1][1]);
  const endM = Number(matches[1][2]);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;

  let isOpen: boolean;
  if (endMinutes <= startMinutes) {
    // Cruza a meia-noite (ex: 18:00 — 00:00, ou 20:00 — 02:00)
    endMinutes += 24 * 60;
    const adjustedNow = nowMinutes < startMinutes ? nowMinutes + 24 * 60 : nowMinutes;
    isOpen = adjustedNow >= startMinutes && adjustedNow < endMinutes;
  } else {
    isOpen = nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }

  return {
    isOpen,
    label: isOpen ? "Aberto agora" : "Fechado agora",
    hoursLabel: `${formatHour(startH, startM)} às ${formatHour(endH, endM)}`,
  };
}
