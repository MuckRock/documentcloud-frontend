<!-- @component
Provides context for its children. Useful as a parent of Viewer in
layouts, stories, and tests.
 -->
<script lang="ts">
  import type {
    Maybe,
    Nullable,
    Document,
    DocumentText,
    Note,
    ViewerMode,
    Zoom,
  } from "$lib/api/types";

  import { afterNavigate } from "$app/navigation";
  import { page as pageState } from "$app/state";
  import { type Snippet, onMount } from "svelte";

  import { pageFromHash, pdfUrl, shouldPaginate } from "$lib/api/documents";
  import { noteFromHash } from "$lib/api/notes";

  import { ViewerState, setViewerState } from "$lib/state/viewer.svelte";

  interface Props {
    document: Document;
    text?: Promise<Maybe<DocumentText>>;
    note?: Nullable<Note>;
    asset_url?: URL;
    embed?: boolean;
    page?: number;
    mode?: ViewerMode;
    zoom?: Zoom;
    errors?: Error[];
    /**
     * Whether to load the document PDF on mount. Lightweight embeds that only
     * show a single note (rendered from a page image) can set this to `false`
     * to avoid fetching the whole PDF.
     */
    loadPdf?: boolean;
    children?: Snippet;
  }

  let {
    document,
    text = new Promise(() => {}),
    note = null,
    asset_url = pdfUrl(document),
    embed = false,
    page = 1,
    mode = "document",
    zoom = 1,
    errors = [],
    loadPdf = true,
    children,
  }: Props = $props();

  // Construct the single viewer state for this subtree and provide it.
  const viewer = new ViewerState();
  setViewerState(viewer);

  // Seed the state from props synchronously, before children read it on their
  // first render. Wrapped in a function so these are ordinary reads rather than
  // top-level reactive captures.
  function seedState() {
    viewer.document = document;
    viewer.text = text;
    viewer.assetUrl = asset_url;
    viewer.embed = embed;
    viewer.mode = mode;
    viewer.zoom = zoom;
    viewer.page = page;
    viewer.currentNote = note;
    viewer.errors = errors;
    // No PDF pipeline for this viewer: consumers render from page images.
    if (!loadPdf) viewer.pdf = null;
  }
  seedState();

  // The document can change without ViewerContext remounting (navigating
  // between documents), so keep it in sync. Other fields are seeded once and
  // then owned by the viewer, so re-seeding them here would clobber in-view
  // interactions (zoom, page).
  $effect(() => {
    viewer.document = document;
  });

  const noteMatchingPageHash = (note: Note) =>
    note.id === noteFromHash(pageState.url.hash);

  function scrollToHash(hash?: string) {
    const page: Nullable<number> = hash ? pageFromHash(hash) : null;
    let el: Maybe<Nullable<HTMLElement>>;
    if (hash) {
      const id = hash.split("#")[1];
      if (id) {
        el = window?.document.getElementById(id);
      }
    }
    // Scroll to the element, if it's available, and update the current page
    if (el && page) {
      el.scrollIntoView();
      viewer.page = page;
    }
  }

  function onHashChange() {
    const { hash } = window.location;
    viewer.currentNote =
      viewer.document?.notes?.find(noteMatchingPageHash) ?? null;
    if (shouldPaginate(viewer.mode)) {
      scrollToHash(hash);
    }
  }

  onMount(() => {
    // we might move this to a load function
    if (loadPdf) viewer.loadPDF(asset_url);
  });

  afterNavigate(() => {
    // refresh state from URL
    const { hash } = pageState.url;
    const hashPage = pageFromHash(hash);
    if (hashPage) {
      viewer.page = hashPage;
    }
    viewer.mode = mode;
    viewer.currentNote =
      viewer.document?.notes?.find(noteMatchingPageHash) ?? null;
    if (shouldPaginate(mode) && (hashPage || 0) > 1) {
      scrollToHash(hash);
    }
  });
</script>

<svelte:window onhashchange={onHashChange} onpopstate={onHashChange} />

{@render children?.()}
