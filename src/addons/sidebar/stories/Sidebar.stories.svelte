<script>
  import { rest } from "msw";
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import { baseApiUrl } from "../../../api/base.js";
  import activeAddons from "../../fixtures/addons-active.json";
  import Sidebar from "../Sidebar.svelte";

  const mockUrl = new URL(`addons/`, baseApiUrl).toString();

  /* Mock Request Handlers */
  const data = rest.get(mockUrl, (req, res, ctx) =>
    res(ctx.json(activeAddons)),
  );
</script>

<style>
  .sidebar {
    padding: 1.5rem 0;
    width: var(--sidebar-width);
    background-color: var(--sidebar);
  }
</style>

<Meta
  title="Add-Ons / Sidebar"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={Sidebar}
/>

<Template>
  <div class="sidebar">
    <Sidebar />
  </div>
</Template>

<Story name="Sidebar" parameters={{ msw: { handlers: [data] } }} />
