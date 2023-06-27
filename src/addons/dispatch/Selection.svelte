<script>
  import { _ } from "svelte-i18n";

  // for talking to the world outside
  import { layout } from "../../manager/layout.js";
  import { search } from "../../search/search.js";

  export let documents = new Set();
  export let value = "";
</script>

{#if documents.size > 0}
  <div class="selection">
    {#if documents.has("documents")}
      <label>
        {$_("addonDispatchDialog.labelQuery", {
          values: { n: search.results.count },
        })}
        <input
          type="radio"
          name="selection"
          value="documents"
          bind:group={value}
        />
      </label>
    {/if}

    {#if documents.has("query")}
      <label>
        {$_("addonDispatchDialog.labelSelected", {
          values: { n: $layout.selected.length },
        })}
        <input
          type="radio"
          name="selection"
          value="query"
          bind:group={value}
        /></label
      >
    {/if}
  </div>
{/if}
