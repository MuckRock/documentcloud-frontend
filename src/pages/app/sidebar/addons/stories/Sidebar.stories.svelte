<script lang="ts" context="module">
  import { rest } from "msw";
  import { Story } from "@storybook/addon-svelte-csf";

  import { baseApiUrl } from "../../../../../api/base.js";
  import activeAddons from "../../../../../addons/fixtures/addons-active.json";
  import Sidebar from "../Sidebar.svelte";

  const mockUrl = new URL(`addons/`, baseApiUrl).toString();

  /* Mock Request Handlers */
  const data = rest.get(mockUrl, (req, res, ctx) =>
    res(ctx.json(activeAddons)),
  );

  export const meta = {
    title: "App / Sidebar / Add-Ons",
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    component: Sidebar,
  };
</script>

<Story name="Default" parameters={{ msw: { handlers: [data] } }}>
  <div class="sidebar">
    <Sidebar />
  </div>
</Story>

<style>
  .sidebar {
    padding: 1.5rem 0;
    width: var(--sidebar-width);
    background-color: var(--sidebar);
  }
</style>
