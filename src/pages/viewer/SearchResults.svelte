<script>
  import { layout } from "@/viewer/layout";
  import { doc, changeMode, restorePosition } from "@/viewer/document";
  import NoWhitespace from "@/common/NoWhitespace";
  import { tick } from "svelte";

  import { handlePlural } from "@/util/string";

  async function handlePage(page) {
    doc.textJump = page;
    await changeMode("text");
  }
</script>

<style lang="scss">
  .results {
    max-width: 700px;
    width: calc(100% - 20px);
    margin: 0 auto;

    > p {
      margin: 20px 0;
    }

    .page {
      margin: 23px 0;
      background: white;
      border-radius: $radius;
      padding: 10px 40px;
      box-sizing: border-box;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.12);
      max-height: 250px;
      overflow: auto;
      cursor: pointer;
      transform: scale(1);
      transition: 0.2s ease transform;

      &:hover {
        transform: scale(1.05);
      }

      h2 {
        background: white;
        font-size: 16px;
        position: sticky;
        top: -10px;
        height: 30px;
        line-height: 30px;

        small {
          font-style: italic;
          font-weight: normal;
          color: $gray;
          margin-left: 8px;
        }
      }

      .result {
        margin: 12px 0;
        border: dashed 1px gainsboro;
        border-radius: $radius;
        padding: 3px 6px;
        background: $faint-yellow;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.12);
        word-break: break-word;

        :global(.highlight) {
          font-weight: bold;
        }
      }
    }
  }
</style>

{#if $layout.searchPages != null}
  <div class="results">
    {#if $layout.totalResults > 0}
      <p>
        {handlePlural($layout.totalResults, "result")} across {handlePlural(
          $layout.searchPages.length,
          "page",
        )}
      </p>
    {:else}
      <p>No search results. Try again with a broader query.</p>
    {/if}
    {#each $layout.searchPages as { page }}
      <div class="page" on:click={() => handlePage(page)}>
        <h2>
          p. {page + 1}
          <small>
            {handlePlural($layout.searchHighlights[page].length, "occurrence")}
          </small>
        </h2>
        {#each $layout.searchHighlights[page] as highlight, offset}
          <div class="result">
            <NoWhitespace>
              {#each highlight as passage}
                <span class:highlight={passage.type == "highlight"}>
                  {passage.text}
                </span>
              {/each}
            </NoWhitespace>
          </div>
        {/each}
      </div>
    {/each}
  </div>
{/if}
