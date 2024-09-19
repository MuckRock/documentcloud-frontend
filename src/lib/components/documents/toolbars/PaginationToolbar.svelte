<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";

  import type { Document, ViewerMode } from "@/lib/api/types";
  import PageToolbar from "../../common/PageToolbar.svelte";
  import Sections from "../Sections.svelte";
  import { shouldPaginate } from "@/lib/api/documents";
  import Paginator from "../../common/Paginator.svelte";
  import Zoom from "../Zoom.svelte";

  export let document: Document;

  const currentMode: Writable<ViewerMode> = getContext("currentMode");
</script>

<PageToolbar>
  <svelte:fragment slot="left">
    {#if $currentMode === "document"}
      <Sections {document} />
    {/if}
  </svelte:fragment>~
  <svelte:fragment slot="center">
    {#if shouldPaginate($currentMode)}
      <Paginator totalPages={document.page_count} />
    {/if}
  </svelte:fragment>

  <Zoom slot="right" mode={$currentMode} />
</PageToolbar>
