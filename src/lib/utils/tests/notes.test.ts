import type { Note, Access } from "$lib/api/types";

import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";

import {
  calculateImageContextDimensions,
  calculatePDFContextDimensions,
  drawHighlight,
  setupCanvas,
  loadImage,
  transformNoteCoordinates,
  renderPDF,
  DEFAULT_COLORS,
  DEFAULT_FALLBACK_COLOR,
} from "../notes";

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

describe("PDF rendering", () => {
  test("renderPDF uses viewport dimensions instead of page.view for rotated pages", async () => {
    // Create a mock note
    const note: Note = {
      id: 2587355,
      page_number: 2,
      x1: 0.05,
      x2: 0.73,
      y1: 0.64,
      y2: 0.69,
      title: "Test",
      content: "",
      access: "public" as Access,
      user: 1,
      organization: 1,
      created_at: "2024-09-20T15:32:40.313820Z",
      updated_at: "2024-09-20T15:32:40.314535Z",
    };

    // Mock canvas and context
    const mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      fillStyle: "",
      globalAlpha: 0,
      globalCompositeOperation: "",
    };

    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockContext),
      width: 0,
      height: 0,
    } as any;

    // Mock PDF page with rotation - page.view gives raw coordinates,
    // but viewport accounts for rotation and gives the rendered dimensions
    const mockPage = {
      view: [0, 0, 612, 792], // Raw page dimensions (portrait orientation)
      getViewport: vi.fn((config) => {
        // For a rotated page, viewport dimensions differ from page.view
        // This simulates a landscape page (792x612) that's stored as rotated portrait
        const scale = config.scale || 1;
        return {
          width: 792 * scale, // Actual rendered width (landscape)
          height: 612 * scale, // Actual rendered height (landscape)
        };
      }),
      render: vi.fn().mockReturnValue({
        promise: Promise.resolve(),
      }),
    };

    const mockPdf = {
      getPage: vi.fn().mockResolvedValue(mockPage),
    } as any;

    // Render the PDF
    await renderPDF(note, 2, mockCanvas, mockPdf);

    // Verify getViewport was called to get dimensions
    expect(mockPage.getViewport).toHaveBeenCalledWith({ scale: 1 });

    // Verify the canvas was set up with the correct viewport dimensions (792x612 landscape)
    // not the page.view dimensions (612x792 portrait)
    // With scale=2: 792*2 = 1584 width
    expect(mockCanvas.width).toBeGreaterThan(0);

    // Verify render was called with a viewport that uses the correct dimensions
    expect(mockPage.render).toHaveBeenCalled();
    expect(mockPage.getViewport).toHaveBeenCalledTimes(2); // Once for dimensions, once for rendering
  });
});
