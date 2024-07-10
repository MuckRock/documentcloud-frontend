<!-- @component
Create, update and delete sections for a single document.
This form is entirely client-side.
-->
<script lang="ts">
  import type { Document, Section } from "$lib/api/types";

  import { invalidate } from "$app/navigation";

  import {
    afterUpdate,
    beforeUpdate,
    createEventDispatcher,
    onMount,
    tick,
  } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    CheckCircle16,
    PlusCircle16,
    Trash16,
    XCircle16,
  } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Text from "../inputs/Text.svelte";
  import Number from "../inputs/Number.svelte";

  import { create, update, remove } from "$lib/api/sections";
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

  // for typescript
  function fixValue(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    return +target.value - 1;
  }
</script>

<form class="card" method="post">
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
      {#each sections as section, i}
        <tr class="section edit" id="section-{section.id}">
          <td class="page_number">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>
              <span class="sr-only">{$_("sections.page")}</span>
              <!-- ts-ignore -->
              <Number
                name="page_number"
                value={section.page_number + 1}
                min={1}
                max={document.page_count}
                required
                on:input={(e) => (section.page_number = fixValue(e))}
              />
            </label>
          </td>
          <td class="title">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>
              <span class="sr-only">{$_("sections.title")}</span>
              <Text name="title" bind:value={section.title} required />
            </label>
          </td>
          <td class="action">
            <Button
              mode="ghost"
              title={$_("sections.update")}
              minW={false}
              name="action"
              value="update"
              on:click={async (e) => {
                await update(document.id, section.id, section, csrftoken);
                await invalidate(`document:${document.id}`);
              }}
            >
              <CheckCircle16 />
            </Button>
            <Button
              mode="ghost"
              title={$_("sections.delete")}
              minW={false}
              name="action"
              value="delete"
              on:click={async (e) => {
                await remove(document.id, section.id, csrftoken);
                await invalidate(`document:${document.id}`);
              }}
            >
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
              value={section.page_number + 1}
              on:input={(e) => (section.page_number = fixValue(e))}
            />
          </label>
        </td>
        <td class="title">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label>
            <span class="sr-only">{$_("sections.title")}</span>
            <Text
              name="title"
              placeholder={$_("sections.title")}
              required
              bind:value={section.title}
            />
          </label>
        </td>
        <td class="action">
          <Button
            mode="ghost"
            title={$_("sections.new")}
            minW={false}
            name="action"
            value="add"
            disabled={existing_pages.has(section.page_number)}
            on:click={async (e) => {
              await create(
                document.id,
                { title: section.title, page_number: section.page_number - 1 },
                csrftoken,
              );
              await invalidate(`document:${document.id}`);
              section = {};
            }}
          >
            <PlusCircle16 />
          </Button>

          <Button
            mode="ghost"
            title={$_("sections.clear")}
            minW={false}
            on:click={(e) => {
              section = { title: "" };
            }}
          >
            <XCircle16 />
          </Button>
        </td>
      </tr>
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
    <Button on:click={() => dispatch("close")}>{$_("dialog.done")}</Button>
  </div>
</form>

<style>
  table,
  thead,
  tfoot {
    width: 100%;

    background: var(--gray-1, #f5f6f7);
  }

  form {
    background: var(--gray-1, #f5f6f7);
    padding: 1rem;
  }

  td,
  th {
    padding: 0 0.5rem 0.5rem 0;
    --font-size: var(--font-s);
  }

  th {
    text-align: start;
    font-size: var(--font-m);
  }

  td.page_number {
    min-width: 10ch;
  }

  td.title {
    min-width: 10ch;
  }

  td.action {
    max-width: 10ch;
    display: flex;
  }

  tr.section {
    padding: 0.125rem;
  }

  .warning {
    font-size: var(--font-s);
    line-height: var(--font-s);
    color: var(--caution);
  }
</style>
