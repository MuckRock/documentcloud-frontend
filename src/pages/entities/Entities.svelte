<script>
  import { onMount } from "svelte";
  import { router } from "@/router/router";
  import { getDocument } from "@/api/document";
  import { getEntities } from "@/api/entity";
  import { jsonUrl } from "@/api/viewer";
  import session from "@/api/session";
  import { Entity } from "../../structure/entity";

  let entities = null;
  let fullText = null;
  let page = 1;

  const SNIPPET_LENGTH = 100;

  function getSnippet(occurrence) {
    const pageText = fullText.pages[occurrence.page].contents;
    return [
      pageText.substring(
        occurrence.page_offset - SNIPPET_LENGTH / 2,
        occurrence.page_offset
      ),
      pageText.substring(
        occurrence.page_offset,
        occurrence.page_offset + occurrence.content.length
      ),
      pageText.substring(
        occurrence.page_offset + occurrence.content.length,
        occurrence.page_offset + occurrence.content.length + SNIPPET_LENGTH / 2
      ),
    ];
  }

  onMount(async () => {
    const id = parseInt(router.resolvedRoute.props.id.split("-")[0]);
    const document = await getDocument(id);
    entities = await getEntities(id);
    fullText = await session.getStatic(jsonUrl(document));
    console.log({ entities, fullText });
  });

  async function nextPage() {
    page = page + 1;
    const id = parseInt(router.resolvedRoute.props.id.split("-")[0]);
    entities = await getEntities(id, page);
  }
</script>

<style>
  .highlight {
    background: rgb(250, 244, 208);
  }
</style>

{#if entities != null && fullText != null}
  {#each entities.entities as entity}
    <div class="entity">
      <h3>{entity.name}</h3>
      <details open>
        <summary><b>{entity.kind}</b></summary>
        <ul>
          {#each entity.occurrences as occurrence}
            <li>
              pg.
              {occurrence.page}:
              <span>{getSnippet(occurrence)[0]}</span><span
                class="highlight">{getSnippet(occurrence)[1]}</span><span>{getSnippet(occurrence)[2]}</span>
            </li>
          {/each}
        </ul>
      </details>
    </div>
  {/each}
  {#if entities.hasNext}
    <button on:click={() => nextPage()}>Next page</button>
  {/if}
{/if}
