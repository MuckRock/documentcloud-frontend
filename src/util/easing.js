import { ensureBounds } from "./bounds";

function sigmoidHelper(t, a) {
  return 1 / (1 + Math.exp(-a * t)) - 0.5;
}

// from https://hackernoon.com/ease-in-out-the-sigmoid-factory-c5116d8abce9
export function sigmoid(t, k = 2) {
  return (0.5 / sigmoidHelper(1, k)) * sigmoidHelper(2 * t - 1, k) + 0.5;
}

export function zeroUntilEnd(t) {
  if (t == 1) return 1;
  return 0;
}

export function scale(tweener, ratio, keepInBounds = true) {
  return (t) => {
    let value = tweener(t / ratio);
    if (keepInBounds) value = ensureBounds(value);
    return value;
  };
}

export function interp(tweener, a, b) {
  return (t) => tweener(t) * (b - a) + a;
}
