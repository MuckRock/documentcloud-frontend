<script>
  import { onMount } from "svelte";
  import { router } from "@/router/router";
  import { getDocument } from "@/api/document";
  import { getEntities, extractEntities } from "@/api/entity";
  import { jsonUrl } from "@/api/viewer";
  import session from "@/api/session";
  import { handlePlural } from "@/util/string";

  import closeSvg from "@/assets/close_inline.svg";

  let loading = true;
  let entities = null;
  let fullText = null;
  let selectedEntity = null;
  let page = 1;

  const SNIPPET_LENGTH = 100;

  async function extract() {
    const id = parseInt(router.resolvedRoute.props.id.split("-")[0]);
    try {
      await extractEntities(id);
      alert(
        "Entities extracting! Refresh this page to see if entities have finished processing (which may take a few minutes). Do not hit extract entities again"
      );
    } catch (e) {
      console.error(e);
      alert(`An unexpected error occurred: ${JSON.stringify(e)}`);
    }
  }

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
    try {
      entities = await getEntities(id);
      fullText = await session.getStatic(jsonUrl(document));
    } catch (e) {
      console.error(e);
    }
    loading = false;
    console.log({ entities, fullText });
  });

  async function pushPage(num) {
    page = num;
    const id = parseInt(router.resolvedRoute.props.id.split("-")[0]);
    selectedEntity = null;
    entities = await getEntities(id, page);
  }

  async function prevPage() {
    pushPage(page - 1);
  }

  async function nextPage() {
    pushPage(page + 1);
  }

  function categorizeEntities(entities) {
    if (entities == null) return {};
    const results = {};
    for (let i = 0; i < entities.entities.length; i++) {
      const entity = entities.entities[i];
      if (results[entity.kind] == null) results[entity.kind] = [];
      results[entity.kind].push(entity);
    }
    return results;
  }

  $: entitiesByCategory = categorizeEntities(entities);
  $: categories =
    entitiesByCategory == null ? [] : Object.keys(entitiesByCategory).sort();
</script>

<style lang="scss">
  .highlight {
    background: rgb(250, 244, 208);
  }

  .body {
    margin: 20px;
  }

  .categories {
    margin: 0 -10px;
  }

  .category {
    border: solid 1px gainsboro;
    margin: 10px;
    display: inline-block;
    vertical-align: top;

    .categorytitle {
      font-weight: bold;
      padding: 6px 10px;
    }

    .entity {
      padding: 4px 10px;
      cursor: pointer;

      .subtitle {
        color: $gray;
        font-weight: 12px;
      }

      &:hover {
        background: $primary;
        color: white;

        .subtitle {
          color: $light-gray;
        }
      }
    }
  }

  .paginator {
    .paginate {
      color: $searchSpecial;
      cursor: pointer;
      user-select: none;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .close {
    @include buttonLike;
    display: inline-block;
    margin-left: 5px;
  }
</style>

<div class="body">
  {#if !loading && entities != null && fullText != null && entities.count > 0}
    <p class="paginator">
      <span>Page&nbsp;</span>
      {#if entities.hasPrev}
        <span class="paginate" on:click={() => prevPage()}>←</span>
      {/if}
      <span class="page">{entities.page + 1}
        of
        {entities.numPages}
        ({(handlePlural(entities.count), 'total entity result')})</span>
      {#if entities.hasNext}
        <span class="paginate" on:click={() => nextPage()}>→</span>
      {/if}
    </p>

    {#if selectedEntity != null}
      <div class="entity">
        <h3>
          {selectedEntity.name}
          <span
            class="close"
            on:click={() => (selectedEntity = null)}>{@html closeSvg}</span>
        </h3>
        <details open>
          <summary><b>{selectedEntity.kind}</b></summary>
          <ul>
            {#each selectedEntity.occurrences as occurrence}
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
    {/if}

    <div class="categories">
      {#each categories as category}
        <div class="category">
          <div class="categorytitle">{category}</div>
          {#each entitiesByCategory[category] as entity}
            <div class="entity" on:click={() => (selectedEntity = entity)}>
              <div class="title">{entity.name}</div>
              <div class="subtitle">
                {handlePlural(entity.occurrences.length, 'occurrence')}
              </div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {:else if loading == false}
    <p>No entities found</p>
    <p><button on:click={extract}>Extract entities</button></p>
  {:else}Loading...{/if}
</div>
