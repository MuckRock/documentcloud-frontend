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

  // store separately to deal with zero-indexed section pages
  let display_number: number = (page_number || 0) + 1;

  $: mode = id ? "edit" : "create";

  function reset() {
    title = "";
    page_number = undefined;
    display_number = undefined;
  }
</script>

<tr class="section {mode}" id="section-{id ?? 'new'}">
  <td class="page_number">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>
      <span class="sr-only">{$_("sections.page")}</span>
      <input
        type="number"
        name="page_number"
        bind:value={display_number}
        min={1}
        max={document.page_count}
        required
        on:input={(e) => (page_number = display_number - 1)}
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
          await create(document.id, { title, page_number }, csrftoken);
          await invalidate(`document:${document.id}`);
          reset();
        }}
      >
        <PlusCircle16 />
      </Button>

      <Button
        mode="ghost"
        title={$_("sections.clear")}
        minW={false}
        on:click={reset}
      >
        <XCircle16 />
      </Button>
    {/if}
  </td>
</tr>

<style>
  td {
    padding: 0 0.5rem 0.5rem 0;
    --font-size: var(--font-sm);
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

  input[type="number"] {
    display: flex;
    padding: 0.375rem 0.75rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    width: 100%;

    border-radius: 0.5rem;
    border: 1px solid var(--gray-3, hwb(205 60% 30%));
    background: var(--white, #fff);
    box-shadow: 0px 2px 0px 0px var(--gray-2, #d8dee2) inset;

    color: var(--gray-5, #233944);
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: "Source Sans Pro";
    font-size: var(--font-size, 1rem);
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
  input::placeholder {
    color: var(--gray-3, #99a8b3);
  }
</style>
