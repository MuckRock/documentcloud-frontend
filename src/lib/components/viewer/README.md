# Viewer

Viewer is, in many ways, the heart of DocumentCloud.
It loads and renders PDFs for reading and writing.

## Context

Viewer makes heavy use of [Svelte's Context APIs](https://svelte.dev/docs/svelte). In `ViewerContext.svelte`, we set independent context values and provide getter shortcuts for them that fully type the return vaues.

The values made available by `ViewerContext` are:

- `document: Document`
- `text: DocumentText`
- `asset_url: URL`
- `embed: boolean`
- `query: string`
- `currentPage: Writable<number>`
- `currentMode: Writable<ViewerMode>`
- `progress: {loaded: number; total: number}`
- `pdf: Promise<pdfjs.PDFDocumentProxy>`

## Modes

Viewer has multiple modes for presenting and interacting with a document:

### File

In File mode, we render each page of the PDF to a `<canvas>` element, the layer on elements with selectable/searchable text, annotations, and pending redactions. Any saved redactions are baked into the PDF file. In File mode, the document can be zoomed to a scale factor, or a fit factor.

### Text

In Text mode, we render each page of OCR-generated text from a PDF.

### Grid

In Grid mode, we render thumbnail images for each page of the PDF. Clicking on a page will navigate to the page in File mode.

### Notes

In Notes mode, we render just the document's annotations in a list.

### Annotating

Annotating mode extends File mode with an interface for drawing new annotations onto the document and letting users edit existing annotations.

### Redacting

Redacting mode extends File mode with an interface for drawing new redactions onto the document. While in Redacting mode, users can undo the redactions they've drawn. Before leaving Redacting mode, a user must decide to discard or save the redactions they made. When saving redactions, the document is reprocessed to bake the redactions into the actual PDF file and OCR is rerun to omit any redacted text.

## Navigation

Navigating the viewer is done through URL, which ensure viewer state flows one way, and that viewer states are linkable.
