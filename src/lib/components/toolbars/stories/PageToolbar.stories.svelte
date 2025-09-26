<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import PageToolbar from "../PageToolbar.svelte";
  import Checkbox from "../../inputs/Checkbox.svelte";
  import Paginator from "$lib/components/common/Paginator.svelte";

  export const meta = {
    title: "Toolbars / Page Toolbar",
    component: PageToolbar,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="slots">
  <PageToolbar>
    <p slot="left">Left</p>
    <p slot="center">Center</p>
    <p slot="right">Right</p>
  </PageToolbar>
</Story>

<Story name="paginator">
  <PageToolbar>
    <Checkbox label="Select all" slot="left" />

    <Paginator slot="center" has_next has_previous page={1} totalPages={100} />

    <select name="per_page" slot="right">
      <option value="25">25 results per page</option>
      <option value="50">50 results per page</option>
      <option value="100">100 results per page</option>
    </select>
  </PageToolbar>
</Story>
