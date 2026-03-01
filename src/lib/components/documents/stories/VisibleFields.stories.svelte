<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import VisibleFieldsComponent, {
    defaultVisibleFields,
  } from "../VisibleFields.svelte";

  import { documentExpanded, data } from "@/test/fixtures/documents";
  import { writable } from "svelte/store";

  const { Story } = defineMeta({
    title: "Documents / Visible Fields",
    component: VisibleFieldsComponent,
    parameters: {
      layout: "centered",
    },
  });
</script>

<script lang="ts">
  import DocumentListItem from "../DocumentListItem.svelte";
  import Menu from "../../common/Menu.svelte";
  import { setVisibleFieldsContext } from "../VisibleFields.svelte";

  const vF = writable(defaultVisibleFields);
  setVisibleFieldsContext(vF);
</script>

{#snippet template(args)}
  <div class="wrapper">
    <Menu><VisibleFieldsComponent {...args} /></Menu>
    <div class="item">
      <DocumentListItem
        document={{ ...documentExpanded, data }}
        visibleFields={$vF}
      />
    </div>
  </div>
{/snippet}

<Story name="Simple" {template} />
<Story name="Advanced" args={{ showAdvanced: true }} {template} />

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
