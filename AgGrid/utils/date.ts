export function toLocalIsoMinutes(d: Date): string {
  const offsetMs = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - offsetMs);
  // AG Grid's `dateTimeString` expects the seconds component so include it.
  // Trim the timezone portion as the grid works with local values.
  return local.toISOString().slice(0, 19);
}
