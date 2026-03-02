<script lang="ts">
  import { _ } from "svelte-i18n";
  import { getSearchResults } from "$lib/state/search.svelte";

  interface Props {
    documents?: any;
    value?: null | Record<string, unknown>;
    query?: undefined | string;
    resultsCount?: undefined | number;
  }

  let {
    documents = new Set(),
    value = $bindable(null),
    query = undefined,
    resultsCount = undefined,
  }: Props = $props();

  const search = getSearchResults();

  // default to the first option, for convenience
  let choice = $derived([...documents][0]);

  $effect(() => {
    switch (choice) {
      case "query":
        value = { query };
        break;
      case "selected":
        value = { documents: search.selected?.map((d) => d.id) ?? [] };
        break;

      default:
        value = null;
    }
  });
</script>

{#if documents.size > 0}
  <fieldset class="selection">
    <legend>{$_("addonDispatchDialog.select")}</legend>
    {#if documents.has("query")}
      <label>
        <input
          type="radio"
          name="selection"
          value="query"
          bind:group={choice}
        />
        {$_("addonDispatchDialog.labelQuery", {
          values: { n: resultsCount ?? 0 },
        })}
      </label>
      <input type="hidden" name="query" value={query} />
    {/if}

    {#if documents.has("selected")}
      <label>
        <input
          type="radio"
          name="selection"
          value="selected"
          bind:group={choice}
        />
        {$_("addonDispatchDialog.labelSelected", {
          values: { n: search.selected?.length },
        })}
      </label>
      <input
        type="hidden"
        name="documents"
        value={search.selected.map((d) => d.id).join(",")}
      />
    {/if}
  </fieldset>
  <p class="help">
    {$_("addonDispatchDialog.selectionHelp")}
    <a data-sveltekit-preload-data="tap" href="/help/add-ons/"
      >{$_("addonDispatchDialog.selectionLearnMore")}</a
    >
  </p>
{/if}

<style>
  fieldset {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    margin: 1rem;
    padding: 1em;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2);
  }

  legend {
    color: var(--gray-5);
    font-weight: 600;
  }

  label {
    display: block;
    line-height: 1.4;
    color: var(--black);
  }

  input[type="radio"] {
    vertical-align: text-top;
  }

  .help {
    margin: 0.5em 1rem 1rem;
    font-size: 0.8em;
    color: var(--gray-5);
    & a {
      display: block;
      margin: 0.5em 0;
      color: var(--primary);
      text-decoration: underline;
    }
  }
</style>
