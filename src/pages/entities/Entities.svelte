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
  let kindFilter = {
    person: true,
    organization: true,
    location: true,
    event: true,
    work_of_art: true,
    consumer_good: true,
    address: true,
    date: true,
    number: true,
    phone_number: true,
    price: true,
    unknown: true,
    other: true,
  };
  let occurrenceFilter = {
    proper: true,
    common: true,
    unknown: true,
  };
  let advancedFilter = {
    relevance: 0,
  };

  function filterize(f) {
    const results = [];
    for (const k in f) {
      if (f.hasOwnProperty(k)) {
        if (f[k]) {
          results.push(`${k}`);
        }
      }
    }
    return results.join(",");
  }

  $: filter = {
    kind: filterize(kindFilter),
    occurrences: filterize(occurrenceFilter),
    relevance__gt: advancedFilter.relevance,
    mid: advancedFilter.mid,
    wikipedia_url: advancedFilter.wikipedia_url,
  };

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
      entities.entities = await getE(id, 1);
      fullText = await session.getStatic(jsonUrl(entities.document));
    } catch (e) {
      console.error(e);
    }
    loading = false;
    console.log({ entities: entities.entities, fullText });
  });

  let pagePushed = false;

  async function pushPage(num) {
    pagePushed = true;
    page = num;
    const id = parseInt(router.resolvedRoute.props.id.split("-")[0]);
    selectedEntity = null;
    entities.entities = await getE(id, page, filter);
  }

  async function applyFilters() {
    await pushPage(page);
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
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (results[entity.kind] == null) results[entity.kind] = [];
      results[entity.kind].push(entity);
    }
    return results;
  }

  $: entitiesByCategory = categorizeEntities(
    ($entities.entities || {}).entities
  );
  $: categories =
    entitiesByCategory == null ? [] : Object.keys(entitiesByCategory).sort();
</script>

<div class="body">
  <p>
    <Link back={true} color={true}>Back</Link>
  </p>
  {#if !loading && $entities.entities != null && fullText != null && ($entities.entities.count > 0 || pagePushed)}
    <p class="paginator">
      <span>Page&nbsp;</span>
      {#if $entities.entities.hasPrev}
        <span class="paginate" on:click={() => prevPage()}>←</span>
      {/if}
      <span class="page"
        >{$entities.entities.page + 1}
        of
        {$entities.entities.numPages}
        ({handlePlural(
          $entities.entities.count,
          "total entity result",
          true
        )})</span
      >
      {#if $entities.entities.hasNext}
        <span class="paginate" on:click={() => nextPage()}>→</span>
      {/if}
    </p>

    <details>
      <!-- Todo: put in separate component -->
      <summary>Filter</summary>
      <div class="filters">
        <div><button on:click={applyFilters}>Apply filters</button></div>
        <div class="filtergroup">
          <h3>Kind</h3>
          <div class="action" on:click={() => (kindFilter = {})}>Clear</div>
          <div>
            <label
              ><input
                type="checkbox"
                bind:checked={kindFilter.person}
              />Person</label
            >
          </div>
          <div>
            <label
              ><input
                type="checkbox"
                bind:checked={kindFilter.organization}
              />Organization</label
            >
          </div>
          <div>
            <label
              ><input
                type="checkbox"
                bind:checked={kindFilter.location}
              />Location</label
            >
          </div>
          <div>
            <label
              ><input
                type="checkbox"
                bind:checked={kindFilter.event}
              />Event</label
            >
          </div>
          <div>
            <label
              ><input
                type="checkbox"
                bind:checked={kindFilter.work_of_art}
              />Work of Art</label
            >
          </div>
          <div>
            <label
              ><input
                type="checkbox"
                bind:checked={kindFilter.consumer_good}
              />Consumer Good</label
            >
          </div>
          <div>
            <label
              ><input
                type="checkbox"
                bind:checked={kindFilter.address}
              />Address</label
            >
          </div>
          <div>
            <label
              ><input
                type="checkbox"
                bind:checked={kindFilter.date}
              />Date</label
            >
          </div>
          <div>
            <label
              ><input
                type="checkbox"
                bind:checked={kindFilter.number}
              />Number</label
            >
          </div>
          <div>
            <label
              ><input
                type="checkbox"
                bind:checked={kindFilter.phone_number}
              />Phone Number</label
            >
          </div>
          <div>
            <label
              ><input
                type="checkbox"
                bind:checked={kindFilter.price}
              />Price</label
            >
          </div>
          <div>
            <label
              ><input
                type="checkbox"
                bind:checked={kindFilter.unknown}
              />Unknown</label
            >
          </div>
          <div>
            <label
              ><input
                type="checkbox"
                bind:checked={kindFilter.other}
              />Other</label
            >
          </div>
        </div>
        <div class="filtergroup">
          <h3>Occurrences</h3>
          <div class="action" on:click={() => (occurrenceFilter = {})}>
            Clear
          </div>
          <div>
            <label
              ><input
                type="checkbox"
                bind:checked={occurrenceFilter.proper}
              />Proper</label
            >
          </div>
          <div>
            <label
              ><input
                type="checkbox"
                bind:checked={occurrenceFilter.common}
              />Common</label
            >
          </div>
          <div>
            <label
              ><input
                type="checkbox"
                bind:checked={occurrenceFilter.unknown}
              />Unknown</label
            >
          </div>
        </div>
        <div class="filtergroup">
          <h3>Advanced</h3>
          <div>
            Relevance threshold:
            <select bind:value={advancedFilter.relevance}>
              {#each Array(101) as _, i}
                <option value={1 - i / 100}>{100 - i}%</option>
              {/each}
            </select>
          </div>
          <div>
            Knowledge graph:
            <select bind:value={advancedFilter.mid}>
              <option value={null}>---</option>
              <option value={true}>Has a knowledge graph ID</option>
              <option value={false}>Does not have a knowledge graph ID</option>
            </select>
          </div>
          <div>
            Wikipedia URL:
            <select bind:value={advancedFilter.wikipedia_url}>
              <option value={null}>---</option>
              <option value={true}>Has a Wikipedia URL</option>
              <option value={false}>Does not have a Wikipedia URL</option>
            </select>
          </div>
        </div>
      </div>
    </details>

    {#if selectedEntity != null}
      <div class="entity">
        <h3>
          {selectedEntity.name}
          <span class="close" on:click={() => (selectedEntity = null)}
            >{@html closeSvg}</span
          >
        </h3>
        <ul>
          {#each selectedEntity.occurrences as occurrence}
            <li>
              <Link
                inlineBlock={true}
                toUrl={$entities.document.relativePageUrl(occurrence.page + 1)}
              >
                pg.
                {occurrence.page + 1}:</Link
              >
              <span>{getSnippet(occurrence)[0]}</span><span class="highlight"
                >{getSnippet(occurrence)[1]}</span
              ><span>{getSnippet(occurrence)[2]}</span>
            </li>
          {/each}
        </ul>
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
              {#if entity.hasWikiUrl}
                <div class="subtitle">
                  <a href={entity.wikiUrl} target="_blank">Wikipedia</a>
                </div>
              {/if}
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
            There are no entities. This could happen if the document doesn’t
            have text, is non-English (only English is supported for now), or
            some error occurred.
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
      padding: 6px 10px;
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

          a {
            color: white;

            &:hover {
              text-decoration: underline;
            }
          }
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

  summary {
    @include buttonLike;
    outline: none;
    margin-left: 8px;
  }

  .filters {
    margin-bottom: 20px;
    display: inline-block;
    border: solid 1px gainsboro;
    padding: 20px 20px 20px 20px;
  }

  .filtergroup {
    display: inline-block;
    vertical-align: top;
    margin-right: 30px;

    h3 {
      margin-bottom: 0.5em;
    }

    .action {
      color: $primary;
      font-size: 13px;
      @include buttonLike;
      margin: 0.5em 0;
    }
  }
</style>
