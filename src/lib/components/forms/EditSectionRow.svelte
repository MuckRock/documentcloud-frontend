<!-- @component
One row of the `EditSections.svelte` form, to encapsulate logic.
-->
<script lang="ts">
  import type { Document, Section } from "$lib/api/types";

  import { invalidate } from "$app/navigation";

  import { _ } from "svelte-i18n";
  import {
    CheckCircle16,
    PlusCircle16,
    Trash16,
    XCircle16,
  } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Number from "../inputs/Number.svelte";
  import Text from "../inputs/Text.svelte";

  import { create, update, remove } from "$lib/api/sections";

  export let csrftoken: string;
  export let disabled = false;
  export let document: Document;
  export let id: number | string = undefined;
  export let page_number: number = undefined;
  export let title: string = "";

  $: mode = id ? "edit" : "create";
</script>

<tr class="section {mode}" id="section-{id ?? 'new'}">
  <td class="page_number">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>
      <span class="sr-only">{$_("sections.page")}</span>
      <Number
        name="page_number"
        value={page_number + 1}
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
      <Text name="title" bind:value={title} required />
    </label>
  </td>
  <td class="action">
    {#if id}
      <Button
        mode="ghost"
        title={$_("sections.update")}
        minW={false}
        name="action"
        value="update"
        {disabled}
        on:click={async (e) => {
          const section = { id, page_number, title };
          await update(document.id, id, section, csrftoken);
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
          await remove(document.id, id, csrftoken);
          await invalidate(`document:${document.id}`);
        }}
      >
        <Trash16 fill="var(--caution)" />
      </Button>
    {:else}
      <Button
        mode="ghost"
        title={$_("sections.new")}
        minW={false}
        name="action"
        value="add"
        {disabled}
        on:click={async (e) => {
          await create(
            document.id,
            { title, page_number: page_number - 1 },
            csrftoken,
          );
          await invalidate(`document:${document.id}`);
        }}
      >
        <PlusCircle16 />
      </Button>

      <Button
        mode="ghost"
        title={$_("sections.clear")}
        minW={false}
        on:click={(e) => {}}
      >
        <XCircle16 />
      </Button>
    {/if}
  </td>
</tr>

<style>
  td {
    padding: 0 0.5rem 0.5rem 0;
    --font-size: var(--font-s);
  }

  td.page_number {
    min-width: 5ch;
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
</style>
