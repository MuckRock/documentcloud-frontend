<script>
  import Note from "./Note";
  import Annotation from "./Annotation";
  import { onMount } from "svelte";
  import { getAnnotations } from "@/api/annotation";

  export let id;
  export let slugId;
  export let page;
  let notes = [];
  let active = null;

  $: shimPlacements =
    active == null
      ? []
      : [
          [0, 0, 1, active.y1], // top
          [0, active.y1, active.x1, active.y2], // left
          [active.x2, active.y1, 1, active.y2], // right
          [0, active.y2, 1, 1], // bottom
        ];

  const isPageResourcePath = /\/documents\/[0-9]+\/pages\/.*\.(txt|gif)$/;

  onMount(async () => {
    const pageResourcePath = isPageResourcePath.exec(window.location.pathname);
    if (pageResourcePath != null) {
      const pageResourceUrl =
        process.env.DC_BASE + "/files" + window.location.pathname;
      // Redirect (dependency-free method for embed compatibility and small package size)
      if (history.pushState) {
        history.pushState({}, null, pageResourceUrl);
      } else {
        window.location.href = pageResourceUrl;
      }
    }

    notes = (await getAnnotations(id, "")).filter(
      (note) => !note.isPageNote && note.page == page - 1,
    );
  });

  function handleClick(note) {
    if (active == note) {
      active = null;
      return;
    }
    if (active != null) return;
    active = note;
  }
</script>

<style lang="scss">
  .dc-embed-shim {
    position: absolute;
    background: rgba(0, 0, 0, 0.4);
    cursor: pointer;
  }
</style>

{#each notes as note}
  {#if active != note}
    <Note on:click={() => handleClick(note)} {note} />
  {/if}
{/each}

{#each shimPlacements as s}
  <div
    class="dc-embed-shim"
    on:click={() => (active = null)}
    style="left:{s[0] * 100}%;top:{s[1] * 100}%;right:{(1 - s[2]) *
      100}%;bottom:{(1 - s[3]) * 100}%"
  />
{/each}

{#if active != null}
  <Annotation note={active} {slugId} {page} />
  <Note active={true} on:click={() => handleClick(active)} note={active} />
{/if}
