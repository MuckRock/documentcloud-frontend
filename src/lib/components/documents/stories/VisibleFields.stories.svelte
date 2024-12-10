<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import VisibleFieldsComponent, {
    defaultVisibleFields,
    defaultViews,
  } from "../VisibleFields.svelte";

  import { documentExpanded, data } from "@/test/fixtures/documents";
  import { setContext } from "svelte";
  import { get, writable } from "svelte/store";

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
  import Menu from "../../common/Menu.svelte";

  const vF = writable(defaultVisibleFields);
  setContext("visibleFields", vF);
</script>

<Template let:args>
  <div class="wrapper">
    <Menu><VisibleFieldsComponent {...args} /></Menu>
    <div class="item">
      <DocumentListItem
        document={{ ...documentExpanded, data }}
        visibleFields={$vF}
      />
    </div>
  </div>
</Template>

<Story name="Simple" />
<Story name="Advanced" args={{ showAdvanced: true }} />

<style>
  .wrapper {
    max-width: 48rem;
    display: flex;
    align-items: flex-start;
    gap: 2rem;
  }
  .item {
    flex: 1 1 auto;
    min-width: 0;
    border: 1px solid var(--gray-2);
    border-radius: 0.5rem;
    padding: 1rem;
  }
</style>
