<!-- @component
Create, update and delete sections for a single document.
This form is entirely client-side.
-->
<script lang="ts">
  import type { Document, Maybe, Section } from "$lib/api/types";

  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import EditSectionRow from "./EditSectionRow.svelte";

  import { getCsrfToken } from "$lib/utils/api";

  interface Props {
    document: Document;
    section?: Partial<Section>;
    onclose?: () => void;
  }

  let { document, section = {}, onclose }: Props = $props();

  let csrftoken: Maybe<string> = $state();

  let sections = $derived(document.sections ?? []);
  let existing_pages = $derived(new Set(sections.map((s) => s.page_number)));

  // If the passed-in section already exists (has an id), it's shown in the
  // list above, so start the "new section" row blank. Otherwise use it as
  // prefill (e.g. the current page number).
  let newSection = $derived(section.id ? {} : section);

  onMount(() => {
    csrftoken = getCsrfToken();
  });
</script>

<form method="post">
  <table>
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
        title={newSection.title}
        page_number={newSection.page_number}
        disabled={Boolean(
          newSection.page_number && existing_pages.has(newSection.page_number),
        )}
      />

      {#if Boolean(newSection.page_number && existing_pages.has(newSection.page_number))}
        <tr class="warning">
          <td colspan="2">
            {$_("sections.overwrite", {
              values: { n: (newSection.page_number ?? 0) + 1 },
            })}
          </td>
        </tr>
      {/if}
    </tfoot>
  </table>
  <div class="buttons">
    <Button mode="primary" onclick={() => onclose?.()}>
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
