<!-- @component
Create, update and delete sections for a single document.
This form is entirely client-side.
-->
<script lang="ts">
  import type { Document, Section } from "$lib/api/types";

  import { beforeUpdate, createEventDispatcher, onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import EditSectionRow from "./EditSectionRow.svelte";

  import { getCsrfToken } from "$lib/utils/api";

  export let document: Document;
  export let section: Partial<Section> = {};

  const dispatch = createEventDispatcher();

  let csrftoken: string;
  let table: HTMLTableElement;

  $: sections = document.sections ?? [];
  $: existing_pages = new Set(sections.map((s) => s.page_number));

  beforeUpdate(() => {
    // updating, so remove new section data
    if (section.id) {
      section = {};
    }
  });

  onMount(() => {
    csrftoken = getCsrfToken();
  });
</script>

<form method="post">
  <table bind:this={table}>
    {#if sections.length}
      <thead>
        <tr>
          <th>
            {$_("sections.page")}
          </th>
          <th colspan="2">
            {$_("sections.title")}
          </th>
        </tr>
      </thead>
    {/if}
    <tbody>
      {#each sections as section}
        <EditSectionRow {document} {...section} {csrftoken} />
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <th colspan="3">
          {$_("sections.new")}
        </th>
      </tr>
      <EditSectionRow
        {document}
        {csrftoken}
        title={section.title}
        page_number={section.page_number}
        disabled={existing_pages.has(section.page_number)}
      />

      {#if existing_pages.has(section.page_number)}
        <tr class="warning">
          <td colspan="2">
            {$_("sections.overwrite", {
              values: { n: section.page_number + 1 },
            })}
          </td>
        </tr>
      {/if}
    </tfoot>
  </table>
  <div class="buttons">
    <Button mode="primary" on:click={() => dispatch("close")}>
      {$_("dialog.done")}
    </Button>
  </div>
</form>

<style>
  table,
  thead,
  tfoot {
    width: 100%;
  }

  form {
    padding: 1rem;
    width: 100%;
  }

  td,
  th {
    padding: 0 0.5rem 0.5rem 0;
    --font-size: var(--font-sm);
  }

  th {
    padding: 0.5rem 0.5rem 0.5rem 0;
    text-align: start;
    font-size: var(--font-md);
    font-weight: var(--font-semibold);
  }

  .warning {
    font-size: var(--font-sm);
    line-height: var(--font-sm);
    color: var(--caution);
  }

  .buttons {
    margin-top: 1rem;
  }
</style>
