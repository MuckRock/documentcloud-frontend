/**
 * Format a Date as a `YYYY-MM-DDThh:mm` string in local time,
 * which is the value format required by <input type="datetime-local">.
 */
export function toDatetimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
