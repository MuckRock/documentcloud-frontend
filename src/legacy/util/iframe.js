export function inIframe() {
  // from https://stackoverflow.com/a/326076
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}
