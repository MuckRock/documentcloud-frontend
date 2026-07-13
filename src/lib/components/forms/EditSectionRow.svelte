<!-- @component
One row of the `EditSections.svelte` form, to encapsulate logic.
-->
<script lang="ts">
  import type {
    APIError,
    Document,
    Maybe,
    ValidationError,
  } from "$lib/api/types";

  import { invalidate } from "$app/navigation";

  import { _ } from "svelte-i18n";
  import {
    CheckCircle16,
    PlusCircle16,
    Trash16,
    XCircle16,
  } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Text from "../inputs/Text.svelte";

  import { update, remove } from "$lib/api/sections";

  interface Props {
    csrftoken?: Maybe<string>;
    disabled?: boolean;
    document: Document;
    id?: Maybe<number | string>;
    page_number?: number;
    title?: string;
    /** Create the pending new section. Only supplied for the "new" row. */
    onadd?: () => void;
    /** Report (or clear) an API error from this row's update/delete. */
    onerror?: (err?: Maybe<APIError<ValidationError>>) => void;
  }

  let {
    csrftoken = undefined,
    disabled = false,
    document,
    id = undefined,
    page_number = $bindable(0),
    title = $bindable(""),
    onadd = undefined,
    onerror = undefined,
  }: Props = $props();

  let mode = $derived(id ? "edit" : "create");

  function reset() {
    title = "";
    page_number = 0;
  }
</script>

<tr class="section {mode}" id="section-{id ?? 'new'}">
  <td class="page_number">
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label>
      <span class="sr-only">{$_("sections.page")}</span>
      <input
        type="number"
        name="page_number"
        value={page_number + 1}
        min={1}
        max={document.page_count}
        required
        oninput={(e) => {
          const n = e.currentTarget.valueAsNumber;
          if (!Number.isNaN(n)) page_number = n - 1;
        }}
      />
    </label>
  </td>
  <td class="title">
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label>
      <span class="sr-only">{$_("sections.title")}</span>
      <Text name="title" bind:value={title} required />
    </label>
  </td>
  <td class="action">
    {#if id}
      <Button
        ghost
        mode="primary"
        title={$_("sections.update")}
        minW={false}
        {disabled}
        onclick={async () => {
          const section = { id, page_number, title };
          const { error } = await update(document.id, id, section, csrftoken);
          onerror?.(error);
          if (error) return;
          await invalidate(`document:${document.id}`);
        }}
      >
        <CheckCircle16 />
      </Button>
      <Button
        ghost
        mode="primary"
        title={$_("sections.delete")}
        minW={false}
        onclick={async () => {
          const { error } = await remove(document.id, id, csrftoken);
          onerror?.(error as Maybe<APIError<ValidationError>>);
          if (error) return;
          await invalidate(`document:${document.id}`);
        }}
      >
        <Trash16 fill="var(--caution)" />
      </Button>
    {:else}
      <Button ghost mode="primary" {disabled} onclick={() => onadd?.()}>
        <PlusCircle16 />
        {$_("sections.new")}
      </Button>

      <Button
        ghost
        mode="primary"
        title={$_("sections.clear")}
        minW={false}
        onclick={reset}
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
    display: flex;
    gap: 0.25rem;
    align-items: center;
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
