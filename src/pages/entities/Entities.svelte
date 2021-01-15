<script>
  import { onMount } from "svelte";
  import { router } from "@/router/router";
  import { getDocument } from "@/api/document";
  import { extractEntities } from "@/api/entity";
  import { jsonUrl } from "@/api/viewer";
  import session from "@/api/session";
  import { handlePlural } from "@/util/string";
  import Link from "@/router/Link";
  import { entities, getE } from "@/entities/entities";
  import { updateInCollection } from "@/manager/documents";
  import Progress from "@/common/Progress";

  import closeSvg from "@/assets/close_inline.svg";

  const CONTACT = process.env.SPECIAL_CONTACT;

  let loading = true;
  let fullText = null;
  let selectedEntity = null;
  let page = 1;
  let extractionError = false;
  let extractionStage = 0;

  const SNIPPET_LENGTH = 100;

  async function extract() {
    if (entities.document == null) return;
    const id = entities.document.id;
    try {
      extractionStage = 1;
      await extractEntities(id);
      entities.document.doc = { ...entities.document.doc, status: "readable" };
      entities.document = entities.document;
      updateInCollection(
        entities.document,
        (d) => (d.doc = { ...d.doc, status: "readable" })
      );
      extractionStage = 2;
    } catch (e) {
      extractionError = true;
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
    entities.document = await getDocument(id);
    try {
      entities.entities = await getE(id);
      fullText = await session.getStatic(jsonUrl(entities.document));
    } catch (e) {
      console.error(e);
    }
    loading = false;
    console.log({ entities: entities.entities, fullText });
  });

  async function pushPage(num) {
    page = num;
    const id = parseInt(router.resolvedRoute.props.id.split("-")[0]);
    selectedEntity = null;
    entities.entities = await getE(id, page);
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

  $: entitiesByCategory = categorizeEntities($entities.entities);
  $: categories =
    entitiesByCategory == null ? [] : Object.keys(entitiesByCategory).sort();
</script>

<div class="body">
  <p>
    <Link back={true} color={true}>Back</Link>
  </p>
  {#if !loading && $entities.entities != null && fullText != null && $entities.entities.count > 0}
    <p class="paginator">
      <span>Page&nbsp;</span>
      {#if $entities.entities.hasPrev}
        <span class="paginate" on:click={() => prevPage()}>←</span>
      {/if}
      <span class="page"
        >{$entities.entities.page + 1}
        of
        {$entities.entities.numPages}
        ({handlePlural($entities.entities.count, "total entity result")})</span
      >
      {#if $entities.entities.hasNext}
        <span class="paginate" on:click={() => nextPage()}>→</span>
      {/if}
    </p>

    {#if selectedEntity != null}
      <div class="entity">
        <h3>
          {selectedEntity.name}
          <span class="close" on:click={() => (selectedEntity = null)}
            >{@html closeSvg}</span
          >
        </h3>
        <details open>
          <summary><b>{selectedEntity.kind}</b></summary>
          <ul>
            {#each selectedEntity.occurrences as occurrence}
              <li>
                pg.
                {occurrence.page}:
                <span>{getSnippet(occurrence)[0]}</span><span class="highlight"
                  >{getSnippet(occurrence)[1]}</span
                ><span>{getSnippet(occurrence)[2]}</span>
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
                {handlePlural(entity.occurrences.length, "occurrence")}
              </div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {:else if loading == false && $entities.document != null}
    <h2>Entity extraction for “{$entities.document.title}”</h2>
    {#if $entities.document.readable}
      <p>
        Extracting entities...
        <Progress initializing={true} progress={0} compact={true} />
      </p>
    {:else}
      <p>
        Welcome to entity extraction! This feature is very much in progress but
        we want it in your hands early to welcome any <a
          href={CONTACT}
          target="_blank">feedback</a
        > you might have.
      </p>
      <p>
        Right now the process for extracting entities is manual. This document
        has not had entities extracted yet, so click below to get started.
      </p>
      {#if extractionError}
        An unexpected error occurred
      {:else if extractionStage == 0 || extractionStage == 2}
        <p><button on:click={extract}>Extract entities</button></p>
        {#if extractionStage == 2}<p>
            Seeing this again? Entity extraction failed. We currently only
            support English documents, but something else could have happened.
            Feel free to try again.
          </p>{/if}
      {:else if extractionStage == 1}
        <p><i>Starting extraction...</i></p>
      {/if}
    {/if}
  {:else}Loading...{/if}
</div>

<style lang="scss">
  p {
    max-width: 33em;
  }

  a {
    color: $primary;
  }

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
