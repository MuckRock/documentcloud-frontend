<!-- @component
Provides context for its children. Useful as a parent of Viewer in
layouts, stories, and tests.
 -->
<script lang="ts" context="module">
  import { getContext, setContext } from "svelte";
  import { type Writable, writable } from "svelte/store";

  import type {
    Maybe,
    Nullable,
    Document,
    DocumentText,
    Note,
    ViewerMode,
  } from "@/lib/api/types";
  import { pdfUrl } from "@/lib/api/documents";

  export function getDocument(): Document {
    return getContext("document");
  }

  export function getText(): Maybe<DocumentText> {
    return getContext("text");
  }

  export function getAssetUrl(): URL {
    return getContext("asset_url");
  }

  export function isEmbedded(): boolean {
    // are we embedded?
    return getContext("embed") ?? false;
  }

  export function getCurrentPage(): Writable<number> {
    return getContext("currentPage");
  }

  export function getCurrentMode(): Writable<ViewerMode> {
    return getContext("currentMode");
  }

  export function getActiveNote(): Writable<Note> {
    return getContext("activeNote");
  }
</script>

<script lang="ts">
  export let document: Document;
  export let text: Maybe<DocumentText> = undefined;
  export let asset_url: URL = pdfUrl(document);
  export let embed: boolean = false;
  export let page: number = 1;
  export let mode: ViewerMode = "document";
  export let note: Nullable<Note> = null;

  // stores we need deeper in the component tree, available via context
  setContext("document", document);
  setContext("text", text);
  setContext("asset_url", asset_url);
  setContext("embed", embed);
  setContext("currentPage", writable(page));
  setContext("activeNote", writable(note));
  setContext("currentMode", writable(mode));
</script>

<slot />
