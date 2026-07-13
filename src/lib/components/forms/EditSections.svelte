<!-- @component
Create, update and delete sections for a single document.
This form is entirely client-side.
-->
<script lang="ts">
  import type {
    APIError,
    Document,
    Maybe,
    Section,
    ValidationError,
  } from "$lib/api/types";

  import { onMount } from "svelte";
  import { invalidate } from "$app/navigation";
  import { _ } from "svelte-i18n";
  import { Alert24 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import EditSectionRow from "./EditSectionRow.svelte";
  import Tip from "../common/Tip.svelte";

  import { create } from "$lib/api/sections";
  import { getCsrfToken } from "$lib/utils/api";
  import { sortedSections } from "$lib/utils/viewer";

  interface Props {
    document: Document;
    section?: Partial<Section>;
    onclose?: () => void;
  }

  let { document, section = {}, onclose }: Props = $props();

  let csrftoken: Maybe<string> = $state();

  let sections = $derived(sortedSections(document));
  let existing_pages = $derived(new Set(sections.map((s) => s.page_number)));

  // Seed the "new section" row: blank if the passed-in section already exists
  // (shown above), else prefill from it. (Fn read avoids state_referenced_locally.)
  function prefill(): Partial<Section> {
    return section.id ? {} : section;
  }
  const initial = prefill();
  let newTitle = $state(initial.title ?? "");
  let newPageNumber = $state(initial.page_number ?? 0);

  // A new section on a page that already has one would overwrite it.
  let collides = $derived(existing_pages.has(newPageNumber));

  // The most recent API error from any create/update/delete on this form.
  let error: Maybe<APIError<ValidationError>> = $state();

  onMount(() => {
    csrftoken = getCsrfToken();
  });

  // Create the pending new section (shared by the row's add button and "Done").
  // Returns false when the API rejects it, so the caller keeps the modal open.
  async function addSection(): Promise<boolean> {
    if (!newTitle.trim() || collides) return true;

    const { error: err } = await create(
      document.id,
      { title: newTitle, page_number: newPageNumber },
      csrftoken,
    );

    if (err) {
      error = err;
      return false;
    }

    error = undefined;
    await invalidate(`document:${document.id}`);
    newTitle = "";
    newPageNumber = 0;
    return true;
  }

  async function done() {
    if (await addSection()) onclose?.();
  }
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
        <EditSectionRow
          {document}
          {...section}
          {csrftoken}
          onerror={(err) => (error = err)}
        />
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
        bind:title={newTitle}
        bind:page_number={newPageNumber}
        disabled={collides}
        onadd={addSection}
      />

      {#if collides}
        <tr class="warning">
          <td colspan="2">
            {$_("sections.overwrite", {
              values: { n: newPageNumber + 1 },
            })}
          </td>
        </tr>
      {/if}
    </tfoot>
  </table>

  {#if error}
    <Tip mode="error">
      {#snippet icon()}<Alert24 />{/snippet}
      <div role="alert">
        <!-- `message` is the HTTP status text, which is empty over HTTP/2, so
             fall back to a generic message; the field errors carry the detail. -->
        <p>{error.message || $_("common.error")}</p>
        {#if Object.keys(error.errors ?? {}).length}
          <ul>
            {#each Object.entries(error.errors ?? {}) as [field, errs]}
              <li>
                <strong>{field}</strong>: {errs.join("; ")}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </Tip>
  {/if}

  <div class="buttons">
    <Button mode="primary" onclick={done}>
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
