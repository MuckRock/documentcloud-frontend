const FPS = 30;

const running = {};

export function tween(data, rate, prop, newVal) {
  if (running[data] == null) running[data] = {};
  let cancelHandle = running[data][prop] == null ? 0 : running[data][prop] + 1;
  running[data][prop] = cancelHandle;
  let dp = data[prop];
  const fn = () => {
    if (Math.round(dp) == newVal || running[data][prop] != cancelHandle) return;
    const diff = newVal - dp;
    dp += diff * rate;
    data[prop] = dp;
    setTimeout(fn, 1000 / FPS)
  };
  fn();
}
