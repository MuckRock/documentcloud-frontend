<script lang="ts" context="module">
  export interface VisibleFields {
    access: boolean;
    thumbnail: boolean;
    meta: boolean;
    description: boolean;
    projects: boolean;
    data: boolean;
    fullTitle: boolean;
    fullDescription: boolean;
  }

  export const defaultVisibleFields: VisibleFields = {
    access: true,
    thumbnail: true,
    meta: true,
    description: false,
    projects: true,
    data: false,
    fullTitle: true,
    fullDescription: false,
  };

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
        fullTitle: true,
        fullDescription: false,
      },
    },
    {
      label: "documentBrowser.fields.balanced",
      icon: Rows24,
      fields: {
        access: true,
        thumbnail: true,
        meta: true,
        description: false,
        projects: true,
        data: false,
        fullTitle: true,
        fullDescription: false,
      },
    },
    {
      label: "documentBrowser.fields.detailed",
      icon: Note24,
      fields: {
        access: true,
        thumbnail: true,
        meta: true,
        description: true,
        projects: true,
        data: true,
        fullTitle: true,
        fullDescription: false,
      },
    },
  ];
</script>

<script lang="ts">
  import type { Writable } from "svelte/store";

  import deepEqual from "fast-deep-equal";
  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  import {
    ListUnordered24,
    Note24,
    Paintbrush16,
    Rows24,
    type SvgComponent,
  } from "svelte-octicons";

  import FieldLabel from "../common/FieldLabel.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import { remToPx } from "$lib/utils/layout";

  const visibleFields = getContext<Writable<VisibleFields>>("visibleFields");

  const labels: Record<keyof VisibleFields, string> = {
    access: "documentBrowser.fields.access",
    fullTitle: "documentBrowser.fields.fullTitle",
    meta: "documentBrowser.fields.meta",
    thumbnail: "documentBrowser.fields.thumbnail",
    description: "documentBrowser.fields.description",
    projects: "documentBrowser.fields.projects",
    data: "documentBrowser.fields.data",
    fullDescription: "documentBrowser.fields.fullDescription",
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
        <SidebarItem
          active={deepEqual(view.fields, $visibleFields)}
          hover
          on:click={() => visibleFields.set(view.fields)}
        >
          <svelte:component this={view.icon} slot="start" />
          {$_(view.label)}
        </SidebarItem>
      </div>
    {/each}
  </div>
  <fieldset class="fields">
    <legend>
      <SidebarItem small>
        <Paintbrush16 slot="start" height={14} width={14} />
        {$_("documentBrowser.fields.customize")}
      </SidebarItem>
    </legend>
    {#each Object.keys($visibleFields) as key}
      <label class="field">
        <input type="checkbox" name={key} bind:checked={$visibleFields[key]} />
        <FieldLabel>{$_(labels[key])}</FieldLabel>
      </label>
    {/each}
  </fieldset>
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
