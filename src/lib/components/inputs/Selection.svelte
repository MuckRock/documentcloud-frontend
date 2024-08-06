<svelte:options accessors />

<script lang="ts">
  import type { Writable } from "svelte/store";
  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  export let documents = new Set();
  export let value = null;
  export let query: string = undefined;
  export let resultsCount: number = undefined;

  const selected: Writable<string[]> = getContext("selected");

  // default to the first option, for convenience
  let choice = [...documents][0];

  $: switch (choice) {
    case "query":
      value = { query };
      break;
    case "selected":
      value = { documents: $selected ?? [] };
      break;

    default:
      value = null;
  }
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
          values: { n: $selected?.length },
        })}
      </label>
      <input type="hidden" name="documents" value={$selected.join(",")} />
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
