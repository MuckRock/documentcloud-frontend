/** Returns true when running on macOS / iOS. */
export function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  // Modern User-Agent Client Hints API
  const platform = (navigator as any).userAgentData?.platform;
  if (platform) return /mac/i.test(platform);
  // Fallback for Firefox / Safari (uses deprecated API)
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
}
