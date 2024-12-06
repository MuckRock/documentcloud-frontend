<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import VisibleFieldsComponent, {
    defaultVisibleFields,
  } from "../VisibleFields.svelte";

  import { documentExpanded, data } from "@/test/fixtures/documents";
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  export const meta = {
    title: "Components / Documents / Visible Fields",
    component: VisibleFieldsComponent,
    parameters: {
      layout: "centered",
    },
  };
</script>

<script lang="ts">
  import DocumentListItem from "../DocumentListItem.svelte";

  const visibleFields = writable(defaultVisibleFields);
  setContext("visibleFields", visibleFields);
</script>

<Template let:args>
  <div class="wrapper">
    <VisibleFieldsComponent {...args} />
    <DocumentListItem
      document={{ ...documentExpanded, data }}
      visibleFields={$visibleFields}
    />
  </div>
</Template>

<Story name="Balanced" />

<style>
  .wrapper {
    max-width: 24rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
