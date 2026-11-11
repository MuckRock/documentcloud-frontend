<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Sync16 } from "svelte-octicons";

  import { getViewerState } from "$lib/state/viewer.svelte";

  import Page from "$lib/components/viewer/Page.svelte";

  interface Props {
    id: number;
    page_number: number;
    width: number;
    height: number;
    margin: number;
    rotation: number;
    src: string;
  }

  let { id, page_number, rotation, width, height, margin, src }: Props =
    $props();

  let missing = $state(false);

  const viewer = getViewerState();

  const document = $derived(viewer.document!);
  const pending = $derived(document.status === "pending");
  const title = $derived(`Page ${page_number}, ${document.title}`);

  // The page image has been deleted after a modification and not regenerated yet
  function onError() {
    if (pending) {
      missing = true;
    }
  }
</script>

{#snippet image(selected = false)}
  <div class={["image", { selected }]}>
    {#if missing}
      <div class="loading" role="img" aria-label={$_("common.loading")}>
        <Sync16 class="spin" fill="var(--gray-4)" />
      </div>
    {:else}
      <img
        {src}
        class:turn={Math.abs(rotation / 90) % 2 === 1}
        alt={title}
        {title}
        loading="lazy"
        onerror={onError}
      />
    {/if}
  </div>
{/snippet}

<div
  class="page-container"
  style:--width="{width}px"
  style:--height="{height}px"
  style:--margin="{margin}px"
  style:--rotation="{rotation}deg"
>
  <Page pageId={id} {page_number}>
    {#snippet children({ documentHref, selected })}
      {#if viewer.mode === "bulk"}
        {@render image(selected)}
      {:else}
        <a href={documentHref}>{@render image()}</a>
      {/if}
    {/snippet}
  </Page>
</div>

<style>
  .page-container {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    width: 100%;
  }

  a {
    display: block;
  }

  .image,
  .loading,
  img {
    width: var(--width);
    height: var(--height);
  }

  img.turn {
    width: var(--height);
    height: var(--width);
  }

  .image {
    position: relative;
    box-shadow: var(--shadow-1);
    margin-bottom: var(--margin);
  }

  img {
    position: absolute;
    top: 50%;
    left: 50%;
    max-width: none;
    transform: translate(-50%, -50%) rotate(var(--rotation));
  }

  img,
  .loading {
    background-color: var(--white);
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .selected {
    outline: 2px solid var(--blue-3);
  }
</style>
