<script lang="ts" context="module">
  export interface VisibleFields {
    access: boolean;
    thumbnail: boolean;
    meta: boolean;
    description: boolean;
    projects: boolean;
    data: boolean;
    wrapTitle: boolean;
  }

  export const defaultViews: Array<{
    label: string;
    icon: typeof SvgComponent;
    fields: VisibleFields;
  }> = [
    {
      label: "documentBrowser.fields.concise",
      icon: ListUnordered24,
      fields: {
        access: true,
        thumbnail: false,
        meta: false,
        description: false,
        projects: false,
        data: false,
        wrapTitle: false,
      },
    },
    {
      label: "documentBrowser.fields.detailed",
      icon: Rows24,
      fields: {
        access: true,
        thumbnail: true,
        meta: true,
        description: true,
        projects: true,
        data: true,
        wrapTitle: true,
      },
    },
  ];

  export const defaultVisibleFields = defaultViews[1]?.fields!;
</script>

<script lang="ts">
  import type { Writable } from "svelte/store";

  import deepEqual from "fast-deep-equal";
  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  import {
    ListUnordered24,
    Paintbrush16,
    Rows24,
    type SvgComponent,
  } from "svelte-octicons";

  import FieldLabel from "../common/FieldLabel.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";
  import { remToPx } from "$lib/utils/layout";

  export let showAdvanced = false;
  export let visibleFields: Writable<VisibleFields> =
    getContext("visibleFields");

  const labels: Record<keyof VisibleFields, string> = {
    access: "documentBrowser.fields.access",
    meta: "documentBrowser.fields.meta",
    thumbnail: "documentBrowser.fields.thumbnail",
    description: "documentBrowser.fields.description",
    projects: "documentBrowser.fields.projects",
    data: "documentBrowser.fields.data",
    wrapTitle: "documentBrowser.fields.wrapTitle",
  };

  let width: number;
</script>

<div
  class="container"
  class:small={width < remToPx(24)}
  bind:clientWidth={width}
>
  <div class="views">
    {#each defaultViews as view}
      <div class="view">
        <NavItem
          active={deepEqual(view.fields, $visibleFields)}
          hover
          on:click={() => visibleFields.set(view.fields)}
        >
          <svelte:component this={view.icon} slot="start" />
          {$_(view.label)}
        </NavItem>
      </div>
    {/each}
  </div>
  {#if showAdvanced}
    <fieldset class="fields">
      <legend>
        <NavItem small>
          <Paintbrush16 slot="start" height={14} width={14} />
          {$_("documentBrowser.fields.customize")}
        </NavItem>
      </legend>
      {#each Object.keys($visibleFields) as key}
        <label class="field">
          <input
            type="checkbox"
            name={key}
            bind:checked={$visibleFields[key]}
          />
          <FieldLabel>{$_(labels[key])}</FieldLabel>
        </label>
      {/each}
    </fieldset>
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
  }

  .views {
    display: flex;
    gap: 0.25rem;
  }

  .view {
    flex: 1 1 auto;
    text-align: left;
  }

  .fields {
    columns: 2;
    border: 1px solid var(--gray-2);
    border-radius: 0.25rem;
    padding: 0.5rem;
  }
  .field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-sm);
  }
  .small .views {
    flex-direction: column;
  }
  .small .fields {
    columns: 1;
  }
</style>
