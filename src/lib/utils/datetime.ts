export function dateFormat(date: Date | string) {
  return new Date(date).toLocaleDateString();
}
