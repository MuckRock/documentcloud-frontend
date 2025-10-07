import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import type { Access, Document, Note, Sizes } from "$lib/api/types";

import { pageImageUrl } from "$lib/api/documents";
import { width, height } from "$lib/api/notes";

const SIZE: Sizes = "large";
const PADDING = 50; // vertical padding in pixels

export function getCanvasContext(
  canvas: HTMLCanvasElement,
): CanvasRenderingContext2D | null {
  const context = canvas.getContext("2d");
  if (!context) {
    console.error("Missing canvas context when rendering note.");
  }
  return context;
}

interface ContextDimensions {
  sourceY: number;
  sourceHeight: number;
  noteWidth: number;
  noteHeight: number;
}

export function calculateImageContextDimensions(
  note: Note,
  image: HTMLImageElement,
): ContextDimensions {
  const noteWidth = width(note) * image.width;
  const noteHeight = height(note) * image.height;
  const sourceY = Math.max(0, note.y1 * image.height - PADDING);
  const sourceHeight = Math.min(
    image.height - sourceY,
    noteHeight + 2 * PADDING,
  );

  return { sourceY, sourceHeight, noteWidth, noteHeight };
}

export function calculatePDFContextDimensions(
  note: Note,
  pageWidth: number,
  pageHeight: number,
  scale: number,
): ContextDimensions {
  const noteWidth = width(note) * pageWidth * scale;
  const noteHeight = height(note) * pageHeight * scale;
  const sourceY = Math.max(0, note.y1 * pageHeight * scale - PADDING);
  const sourceHeight = Math.min(
    pageHeight * scale - sourceY,
    noteHeight + 2 * PADDING,
  );

  return { sourceY, sourceHeight, noteWidth, noteHeight };
}

export function drawHighlight(
  context: CanvasRenderingContext2D,
  fillStyle: string,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  context.save();
  context.fillStyle = fillStyle;
  context.globalAlpha = 0.5;
  context.globalCompositeOperation = "multiply";
  context.fillRect(x, y, width, height);
  context.restore();
}

export function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  dpr: number = 1,
): void {
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
}

function computeCssVar(varName: string, fallback: string): string {
  const computedStyle = getComputedStyle(globalThis.document.documentElement);
  return computedStyle.getPropertyValue(varName).trim() || fallback;
}

export const DEFAULT_COLORS: Record<Access, string> = {
  public: "#eccb6b",
  private: "#4294f0",
  organization: "#27c6a2",
} as const;

export const DEFAULT_FALLBACK_COLOR = "#d8dee2";

export function isServerSide(): boolean {
  return typeof window === "undefined";
}

export function getAccessColor(access: Access): string {
  return DEFAULT_COLORS[access];
}

function getHighlightColor(note: Note): string {
  if (isServerSide()) {
    return DEFAULT_COLORS[note.access] || DEFAULT_FALLBACK_COLOR;
  }

  switch (note.access) {
    case "public":
      return computeCssVar("--note-public", DEFAULT_COLORS.public);
    case "private":
      return computeCssVar("--note-private", DEFAULT_COLORS.private);
    case "organization":
      return computeCssVar("--note-org", DEFAULT_COLORS.organization);
    default:
      return computeCssVar("--gray-2", DEFAULT_FALLBACK_COLOR);
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = src;
  });
}

interface NoteCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function transformNoteCoordinates(
  note: Note,
  containerWidth: number,
  containerHeight: number,
  scale: number = 1,
): NoteCoordinates {
  return {
    x: note.x1 * containerWidth * scale,
    y: note.y1 * containerHeight * scale,
    width: width(note) * containerWidth * scale,
    height: height(note) * containerHeight * scale,
  };
}

export async function renderImage(
  note: Note,
  canvas: HTMLCanvasElement,
  document: Document,
) {
  const page_number = note.page_number;
  const context = getCanvasContext(canvas);
  if (!context) {
    return;
  }

  const src = pageImageUrl(document, page_number, SIZE);
  const image = await loadImage(src.href);

  // Calculate dimensions for full-width context with padding
  const dimensions = calculateImageContextDimensions(note, image);

  // Set canvas to full width with padded height
  setupCanvas(canvas, image.width, dimensions.sourceHeight);

  // Draw the full-width context
  context.drawImage(
    image,
    0, // source x - full width
    dimensions.sourceY, // source y - with padding
    image.width, // source width - full width
    dimensions.sourceHeight, // source height - note height + padding
    0, // dest x
    0, // dest y
    image.width, // dest width
    dimensions.sourceHeight, // dest height
  );

  // Draw highlight rectangle on canvas
  // The highlight Y position is the note's Y position minus the source Y offset
  const highlightY = note.y1 * image.height - dimensions.sourceY;
  drawHighlight(
    context,
    getHighlightColor(note),
    note.x1 * image.width,
    highlightY,
    dimensions.noteWidth,
    dimensions.noteHeight,
  );
}

export async function renderPDF(
  note: Note,
  scale: number,
  canvas: HTMLCanvasElement,
  pdf: PDFDocumentProxy,
) {
  const page_number = note.page_number + 1; // note pages are 0-indexed
  const context = getCanvasContext(canvas);
  if (!context) {
    return;
  }

  const page = await pdf.getPage(page_number);
  const [, , w, h] = page.view;

  if (!w || !h) {
    console.error("Missing page dimensions when rendering PDF in note.");
    return;
  }

  // Calculate dimensions for context with padding
  const dimensions = calculatePDFContextDimensions(note, w, h, scale);

  const viewport = page.getViewport({
    scale,
    offsetX: 0, // full width
    offsetY: -dimensions.sourceY,
  });

  const dpr = window?.devicePixelRatio ?? 1;
  const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined;

  // Set the pixel dimensions of the canvas to full width with padding
  setupCanvas(canvas, w * scale, dimensions.sourceHeight, dpr);

  const renderTask = page.render({
    canvasContext: context,
    viewport,
    transform,
  });

  await renderTask.promise;

  // Draw highlight rectangle on canvas after PDF rendering is complete
  // The highlight Y position is the note's Y position minus the context offset
  const highlightY = note.y1 * h * scale - dimensions.sourceY;
  drawHighlight(
    context,
    getHighlightColor(note),
    note.x1 * w * scale * dpr,
    highlightY * dpr,
    dimensions.noteWidth * dpr,
    dimensions.noteHeight * dpr,
  );
}
