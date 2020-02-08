<script>
  export let sectionOrNote;
  import { hoveredNote } from "@/viewer/hoveredNote";
  import { layout, showAnnotation } from "@/viewer/layout";
  import { restorePosition } from "@/viewer/renderer";

  // SVG assets
  import smallCircleSvg from "@/assets/small_circle.svg";
</script>

<style lang="scss">
  summary {
    outline: none;
    user-select: none;
    cursor: pointer;
    font-size: 10px;
    color: $gray;
    margin: 0 -10px;
  }

  .page {
    color: #666;
    font-size: 12px;
    padding-left: 4px;
    font-weight: normal;
  }

  .title {
    color: #004276;
    font-weight: bold;
    font-size: 13px;
  }

  .section {
    @include buttonLike;
  }

  .note {
    cursor: pointer;

    .page {
      visibility: hidden;
    }

    &:hover,
    &.hover {
      .title {
        text-decoration: underline;
      }

      .page {
        visibility: visible;
      }
    }
  }

  .section,
  .note {
    margin: 4px 0;
  }

  .children {
    :global(.title) {
      font-size: 12px;
      font-weight: normal;
      text-decoration: underline;
    }
  }

  ul {
    margin: 0;
    padding-left: 10px;

    li {
      list-style: none;
      margin: 3px 0;
      padding: 0;

      .circle {
        margin-right: 2px;
      }

      > * {
        display: inline-block;
        vertical-align: middle;
      }
    }
  }
</style>

{#if sectionOrNote.type == 'section'}
  <!-- Show section -->
  {#if sectionOrNote.children.length > 0}
    <details open>
      <summary>
        <span
          class="section"
          on:click|preventDefault={() => restorePosition(sectionOrNote.section.page - 1)}>
          <span class="title">{sectionOrNote.section.title}</span>
          <span class="page">p. {sectionOrNote.section.page}</span>
        </span>
      </summary>
      <ul class="children">
        {#each sectionOrNote.children as child}
          <li>
            <span class="circle">
              {@html smallCircleSvg}
            </span>
            <svelte:self sectionOrNote={child} />
          </li>
        {/each}
      </ul>
    </details>
  {:else}
    <div
      class="section"
      on:click={() => restorePosition(sectionOrNote.section.page - 1)}>
      <span class="title">{sectionOrNote.section.title}</span>
      <span class="page">p. {sectionOrNote.section.page}</span>
    </div>
  {/if}
{:else}
  <!-- Show note -->
  <div
    class="note"
    class:hover={sectionOrNote.note == $layout.hoveredNote}
    use:hoveredNote={sectionOrNote.note}
    on:click={() => showAnnotation(sectionOrNote.note)}>
    <span class="title">{sectionOrNote.note.title}</span>
    <span class="page">p. {sectionOrNote.note.page + 1}</span>
  </div>
{/if}
