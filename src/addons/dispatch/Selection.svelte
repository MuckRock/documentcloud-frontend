<svelte:options accessors />

<script>
  import { _ } from "svelte-i18n";

  // for talking to the world outside
  import { layout } from "../../manager/layout.js";
  import { search } from "../../search/search.js";

  export let documents = new Set();
  export let value = null;

  // default to the first option, for convenience
  let choice = [...documents][0];

  $: switch (choice) {
    case "query":
      value = { query: $search.params.params.q };
      break;
    case "selected":
      value = { documents: $layout.selected.map((d) => d.id) };
      break;

    default:
      value = null;
  }
</script>

<style>
  fieldset {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    margin: 0;
    padding: 1em;
    border-radius: var(--radius);
    border-color: rgba(0, 0, 0, 0.1);
    border-width: 1px;
  }

  legend {
    color: var(--darkgray);
    font-weight: 600;
  }

  label {
    display: block;
    line-height: 1.4;
    color: var(--darkgray);
  }

  input[type="radio"] {
    vertical-align: text-top;
  }

  .help {
    margin: 0.5em 1rem 1rem;
    font-size: 0.8em;
    color: var(--gray);
    & a {
      display: block;
      margin: 0.5em 0;
      color: var(--primary);
      text-decoration: underline;
    }
  }
</style>

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
          values: { n: $search?.results?.count ?? 0 },
        })}
      </label>
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
          values: { n: $layout.selected?.length },
        })}
      </label>
    {/if}
  </fieldset>
  <p class="help">
    {$_("addonDispatchDialog.selectionHelp")}
    <a href="/help/add-ons">{$_("addonDispatchDialog.selectionLearnMore")}</a>
  </p>
{/if}
