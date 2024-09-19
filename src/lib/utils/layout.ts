const REM_BASE = 16;

/** Calcuates the px value for a provided rem amount. */
export function remToPx(num: number): number {
  return REM_BASE * num;
}
