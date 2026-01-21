<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import VisibleFieldsComponent, {
    defaultVisibleFields,
    defaultViews,
  } from "../VisibleFields.svelte";

  import { documentExpanded, data } from "@/test/fixtures/documents";
  import { get, writable } from "svelte/store";

  export const meta = {
    title: "Documents / Visible Fields",
    component: VisibleFieldsComponent,
    parameters: {
      layout: "centered",
    },
  };
</script>

<script lang="ts">
  import DocumentListItem from "../DocumentListItem.svelte";
  import Menu from "../../common/Menu.svelte";
  import { setVisibleFieldsContext } from "../VisibleFields.svelte";

  const vF = writable(defaultVisibleFields);
  setVisibleFieldsContext(vF);
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
