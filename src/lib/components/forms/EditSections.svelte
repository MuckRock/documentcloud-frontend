<!-- @component
Create, update and delete sections for a single document
-->
<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { PlusCircle16, Trash16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Text from "../inputs/Text.svelte";
  import Number from "../inputs/Number.svelte";

  export let document: Document;

  $: sections = document.sections ?? [];
</script>

<form action="" method="post">
  <table>
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

    <tbody>
      {#each sections as section, i}
        <tr class="section edit">
          <td class="page_number">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>
              <span class="sr-only">{$_("sections.page")}</span>
              <Number
                name="page_number"
                value={section.page_number}
                min={1}
                max={document.page_count}
                required
              />
            </label>
          </td>
          <td class="title">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>
              <span class="sr-only">{$_("sections.title")}</span>
              <Text name="title" value={section.title} required />
            </label>
          </td>
          <td class="action">
            <Button mode="ghost" title={$_("sections.delete")} minW={false}>
              <Trash16 fill="var(--caution)" />
            </Button>
          </td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <th colspan="3">
          {$_("sections.new")}
        </th>
      </tr>
      <tr class="section create">
        <td class="page_number">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label>
            <span class="sr-only">{$_("sections.page")}</span>
            <Number
              name="page_number"
              placeholder={$_("sections.page")}
              min={1}
              max={document.page_count}
              required
            />
          </label>
        </td>
        <td class="title">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label>
            <span class="sr-only">{$_("sections.title")}</span>
            <Text name="title" placeholder={$_("sections.title")} required />
          </label>
        </td>
        <td class="action">
          <Button mode="ghost" title={$_("sections.delete")} minW={false}>
            <PlusCircle16 />
          </Button>
        </td>
      </tr>
    </tfoot>
  </table>
</form>

<style>
  table,
  thead,
  tfoot {
    padding: 0.25rem 0.375rem;
    width: 100%;

    background: var(--gray-1, #f5f6f7);
  }

  td,
  th {
    padding: 0 0.5rem 0.5rem 0;
  }

  th {
    text-align: start;
  }

  td.page_number {
    min-width: 10ch;
  }

  td.title {
    min-width: 10ch;
  }

  td.action {
    max-width: 10ch;
  }

  tr.section {
    padding: 0.125rem;
  }
</style>
