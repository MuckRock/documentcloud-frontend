import "@testing-library/svelte/vitest";
import "@testing-library/jest-dom/vitest";
import "./src/lib/i18n/index.js";

import { vi } from "vitest";
import ResizeObserver from "resize-observer-polyfill";

vi.stubGlobal("ResizeObserver", ResizeObserver);

// https://github.com/dominikg/vitest-example-svelte5/blob/main/vitest-setup-client.ts
// required for svelte5 + jsdom as jsdom does not support matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  enumerable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Web Animations API for Svelte 5 transitions
// jsdom doesn't support element.animate()
HTMLElement.prototype.animate = vi.fn(() => ({
  finished: Promise.resolve(),
  cancel: vi.fn(),
  onfinish: null,
}));

// Mock CSS.supports for jsdom
window.CSS = window.CSS || {};
window.CSS.supports = vi.fn(() => false);
