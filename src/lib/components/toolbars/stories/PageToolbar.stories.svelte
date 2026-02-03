<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PageToolbar from "../PageToolbar.svelte";
  import Checkbox from "../../inputs/Checkbox.svelte";
  import Paginator from "$lib/components/common/Paginator.svelte";

  const { Story } = defineMeta({
    title: "Toolbars / Page Toolbar",
    component: PageToolbar,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });
</script>

<Story name="slots">
  <PageToolbar>
    {#snippet left()}
      <p>Left</p>
    {/snippet}
    {#snippet center()}
      <p>Center</p>
    {/snippet}
    {#snippet right()}
      <p>Right</p>
    {/snippet}
  </PageToolbar>
</Story>

<Story name="paginator">
  <PageToolbar>
    {#snippet left()}
      <Checkbox label="Select all" />
    {/snippet}
    {#snippet center()}
      <Paginator has_next has_previous page={1} totalPages={100} />
    {/snippet}
    {#snippet right()}
      <select name="per_page">
        <option value="25">25 results per page</option>
        <option value="50">50 results per page</option>
        <option value="100">100 results per page</option>
      </select>
    {/snippet}
  </PageToolbar>
</Story>
