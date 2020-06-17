<script>
  import NoWhitespace from "@/common/NoWhitespace";
  export let sectionOrNote;
  import { hoveredNote } from "@/viewer/hoveredNote";
  import { layout } from "@/viewer/layout";
  import { restorePosition, showAnnotation } from "@/viewer/renderer";

  // SVG assets
  import smallCircleSvg from "@/assets/small_circle.svg";
</script>

<style lang="scss">
  .page {
    color: #666;
    font-size: 12px;
    padding-left: 4px;
    font-weight: normal;
  }

  .title {
    color: $viewerLink;
    font-weight: bold;
    font-size: 13px;
  }

  .section {
    @include buttonLike;
    padding: 4px 0;
  }

  .note {
    cursor: pointer;

    &:hover,
    &.hover {
      .title {
        text-decoration: underline;
      }
    }
  }

  details {
    margin: 8px 0 2px 0;
  }

  .note,
  .section {
    margin: 4px 0;
  }

  .children {
    :global(.title) {
      font-size: 12px;
      font-weight: normal;
      text-decoration: none;
    }
  }

  ul {
    margin: 0;
    padding-left: 10px;

    li {
      list-style: none;
      margin: 0;
      padding: 0;
      padding-left: 10px;
      text-indent: -6px;

      .circle {
        margin-right: 5px;
      }

      > :global(span > *) {
        display: inline-block;
        vertical-align: middle;
      }

      :global(.note) {
        display: inline;
      }
    }
  }
</style>

{#if sectionOrNote.type == 'section'}
  <!-- Show section -->
  {#if sectionOrNote.children.length > 0}
    <details class="dc" open>
      <summary>
        <span
          class="section"
          on:click|preventDefault={() => restorePosition(sectionOrNote.section.page)}>
          <NoWhitespace>
            <span class="title">{sectionOrNote.section.title}</span>
            <span>&nbsp;</span>
            <span class="page">p.&nbsp;{sectionOrNote.section.page + 1}</span>
          </NoWhitespace>
        </span>
      </summary>
      <ul class="children">
        {#each sectionOrNote.children as child}
          <li>
            <NoWhitespace>
              <span class="circle">
                {@html smallCircleSvg}
              </span>
              <span>&nbsp;</span>
              <svelte:self sectionOrNote={child} />
            </NoWhitespace>
          </li>
        {/each}
      </ul>
    </details>
  {:else}
    <div
      class="section"
      on:click={() => restorePosition(sectionOrNote.section.page)}>
      <NoWhitespace>
        <span class="title">{sectionOrNote.section.title}</span>
        <span>&nbsp;</span>
        <span class="page">p.&nbsp;{sectionOrNote.section.page + 1}</span>
      </NoWhitespace>
    </div>
  {/if}
{:else}
  <!-- Show note -->
  <div
    class="note"
    class:hover={sectionOrNote.note == $layout.hoveredNote}
    use:hoveredNote={sectionOrNote.note}
    on:click={() => showAnnotation(sectionOrNote.note, true)}>
    <NoWhitespace>
      <span class="title">{sectionOrNote.note.title}</span>
      <span>&nbsp;</span>
      <span class="page">p.&nbsp;{sectionOrNote.note.page + 1}</span>
    </NoWhitespace>
  </div>
{/if}
