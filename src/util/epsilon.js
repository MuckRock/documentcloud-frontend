export function withinPercent(num1, num2, eps) {
  if (num1 == null || num2 == null || num2 == 0) return false;

  const ratio = Math.max(num1, num2) / Math.min(num1, num2);
  return ratio - 1 <= eps;
}
