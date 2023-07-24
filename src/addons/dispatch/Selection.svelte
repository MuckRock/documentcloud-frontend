<svelte:options accessors />

<script>
  import { _ } from "svelte-i18n";

  // for talking to the world outside
  import { layout } from "../../manager/layout.js";
  import { search } from "../../search/search.js";

  export let documents = new Set();
  export let value = "";

  let choice;

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
  label {
    display: block;
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
          values: { n: $search.results.count },
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
          values: { n: $layout.selected.length },
        })}
      </label>
    {/if}
  </fieldset>
{/if}
