import "@testing-library/svelte/vitest";
import "@testing-library/jest-dom/vitest";
import "./src/lib/i18n/index.js";

import { vi } from "vitest";
import ResizeObserver from "resize-observer-polyfill";

vi.stubGlobal("ResizeObserver", ResizeObserver);
