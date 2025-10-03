import type { Note, Access } from "$lib/api/types";

import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";

import {
  getCanvasContext,
  calculateImageContextDimensions,
  calculatePDFContextDimensions,
  drawHighlight,
  setupCanvas,
  isServerSide,
  getAccessColor,
  loadImage,
  transformNoteCoordinates,
  DEFAULT_COLORS,
  DEFAULT_FALLBACK_COLOR,
} from "../notes";

// Set up mock handlers and data
vi.mock("$lib/api/notes", () => ({
  width: (note: any) => note.x2 - note.x1,
  height: (note: any) => note.y2 - note.y1,
}));
const mockDocument = {
  documentElement: {
    style: {
      getPropertyValue: vi.fn(),
    },
  },
};
const mockGetComputedStyle = vi.fn();
const mockNote: Note = {
  id: 1,
  page_number: 0,
  x1: 0.1,
  y1: 0.2,
  x2: 0.5,
  y2: 0.4,
  title: "Test Note",
  content: "Test content",
  access: "public" as Access,
  user: 1,
  organization: 1,
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
};

beforeEach(() => {
  vi.stubGlobal("document", mockDocument);
  vi.stubGlobal("getComputedStyle", mockGetComputedStyle);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Canvas utilities", () => {
  let mockContext: Partial<CanvasRenderingContext2D>;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    mockContext = { fillRect: vi.fn() };
    mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockContext),
      width: 0,
      height: 0,
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("getCanvasContext returns context when available", () => {
    const result = getCanvasContext(mockCanvas);
    expect(result).toBe(mockContext);
    expect(mockCanvas.getContext).toHaveBeenCalledWith("2d");
  });

  test("getCanvasContext returns null and logs error when context unavailable", () => {
    // Set up
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(null),
    } as any;
    // Execute
    const result = getCanvasContext(mockCanvas);
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(String));
    // Clean up
    consoleSpy.mockRestore();
  });

  test("setupCanvas sets dimensions correctly", () => {
    setupCanvas(mockCanvas, 800, 600);
    expect(mockCanvas.width).toBe(800);
    expect(mockCanvas.height).toBe(600);
  });

  test("setupCanvas applies device pixel ratio", () => {
    setupCanvas(mockCanvas, 800, 600, 2);
    expect(mockCanvas.width).toBe(1600);
    expect(mockCanvas.height).toBe(1200);
  });
});

describe("Dimension calculations", () => {
  const mockImage = { width: 1000, height: 1000 };

  test("calculateImageContextDimensions calculates correct dimensions", () => {
    const result = calculateImageContextDimensions(
      mockNote,
      mockImage as HTMLImageElement,
    );

    // Note dimensions: x1=0.1, y1=0.2, x2=0.5, y2=0.4
    // So width = 0.4, height = 0.2
    expect(result.noteWidth).toBe(400); // 0.4 * 1000
    expect(result.noteHeight).toBe(200); // 0.2 * 1000
    expect(result.sourceY).toBe(150); // max(0, 0.2 * 1000 - 50) = max(0, 150)
    expect(result.sourceHeight).toBe(300); // min(1000 - 150, 200 + 100) = min(850, 300) = 300
  });

  test("calculateImageContextDimensions handles edge case at top of image", () => {
    const topNote = { ...mockNote, y1: 0.01, y2: 0.05 }; // Very near top

    const result = calculateImageContextDimensions(
      topNote,
      mockImage as HTMLImageElement,
    );

    expect(result.sourceY).toBe(0); // max(0, 10 - 50) = 0
  });

  test("calculatePDFContextDimensions calculates correct dimensions with scale", () => {
    const result = calculatePDFContextDimensions(mockNote, 800, 600, 2);

    // Note dimensions with scale: width = 0.4 * 800 * 2, height = 0.2 * 600 * 2
    expect(result.noteWidth).toBe(640); // 0.4 * 800 * 2
    expect(result.noteHeight).toBe(240); // 0.2 * 600 * 2
    expect(result.sourceY).toBe(190); // max(0, 0.2 * 600 * 2 - 50) = max(0, 190)
    expect(result.sourceHeight).toBe(340); // min(1200 - 190, 240 + 100) = min(1010, 340) = 340
  });
});

describe("Highlight drawing", () => {
  test("drawHighlight applies correct styles and calls fillRect", () => {
    const mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      fillStyle: "",
      globalAlpha: 0,
      globalCompositeOperation: "",
    };

    drawHighlight(mockContext as any, "#ff0000", 100, 200, 300, 150);

    expect(mockContext.save).toHaveBeenCalled();
    expect(mockContext.fillStyle).toBe("#ff0000");
    expect(mockContext.globalAlpha).toBe(0.5);
    expect(mockContext.globalCompositeOperation).toBe("multiply");
    expect(mockContext.fillRect).toHaveBeenCalledWith(100, 200, 300, 150);
    expect(mockContext.restore).toHaveBeenCalled();
  });
});

describe("Color utilities", () => {
  test("isServerSide returns true when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    expect(isServerSide()).toBe(true);
  });

  test("isServerSide returns false when window is defined", () => {
    vi.stubGlobal("window", {});
    expect(isServerSide()).toBe(false);
  });

  test("getAccessColor returns correct colors for each access type", () => {
    expect(getAccessColor("public" as Access)).toBe("#eccb6b");
    expect(getAccessColor("private" as Access)).toBe("#4294f0");
    expect(getAccessColor("organization" as Access)).toBe("#27c6a2");
  });

  test("DEFAULT_COLORS contains expected values", () => {
    expect(DEFAULT_COLORS.public).toBe("#eccb6b");
    expect(DEFAULT_COLORS.private).toBe("#4294f0");
    expect(DEFAULT_COLORS.organization).toBe("#27c6a2");
  });

  test("DEFAULT_FALLBACK_COLOR is correct", () => {
    expect(DEFAULT_FALLBACK_COLOR).toBe("#d8dee2");
  });
});

describe("Image loading utility", () => {
  test("loadImage resolves with image on successful load", async () => {
    // Mock Image constructor
    const mockImage = {
      addEventListener: vi.fn(),
      src: "",
    };

    vi.stubGlobal(
      "Image",
      vi.fn(() => mockImage),
    );

    const promise = loadImage("test-image.jpg");

    // Simulate successful load
    const loadCall = mockImage.addEventListener.mock.calls.find(
      (call) => call[0] === "load",
    );
    const loadHandler = loadCall?.[1];
    loadHandler();

    const result = await promise;
    expect(result).toBe(mockImage);
    expect(mockImage.src).toBe("test-image.jpg");
  });

  test("loadImage rejects on image error", async () => {
    const mockImage = {
      addEventListener: vi.fn(),
      src: "",
    };

    vi.stubGlobal(
      "Image",
      vi.fn(() => mockImage),
    );

    const promise = loadImage("invalid-image.jpg");

    // Simulate error
    const errorCall = mockImage.addEventListener.mock.calls.find(
      (call) => call[0] === "error",
    );
    const errorHandler = errorCall?.[1];
    const testError = new Error("Image failed to load");
    errorHandler(testError);

    await expect(promise).rejects.toBe(testError);
  });
});

describe("Coordinate transformation", () => {
  test("transformNoteCoordinates calculates correct coordinates", () => {
    const result = transformNoteCoordinates(mockNote, 1000, 800, 1);

    expect(result.x).toBe(100); // 0.1 * 1000 * 1
    expect(result.y).toBe(160); // 0.2 * 800 * 1
    expect(result.width).toBe(400); // 0.4 * 1000 * 1
    expect(result.height).toBe(160); // 0.2 * 800 * 1
  });

  test("transformNoteCoordinates applies scale correctly", () => {
    const result = transformNoteCoordinates(mockNote, 1000, 800, 2);

    expect(result.x).toBe(200); // 0.1 * 1000 * 2
    expect(result.y).toBe(320); // 0.2 * 800 * 2
    expect(result.width).toBe(800); // 0.4 * 1000 * 2
    expect(result.height).toBe(320); // 0.2 * 800 * 2
  });

  test("transformNoteCoordinates uses default scale of 1", () => {
    const result = transformNoteCoordinates(mockNote, 1000, 800);

    expect(result.x).toBe(100);
    expect(result.y).toBe(160);
    expect(result.width).toBe(400);
    expect(result.height).toBe(160);
  });
});
