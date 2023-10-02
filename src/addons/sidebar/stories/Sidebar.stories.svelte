<script>
  import { rest } from "msw";
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import { baseApiUrl } from "../../../api/base.js";
  import activeAddons from "../../fixtures/addons-active.json";
  import Sidebar from "../Sidebar.svelte";
  import SidebarDemo from "./Sidebar.demo.svelte";

  const mockUrl = new URL(`addons/`, baseApiUrl).toString();

  /* Mock Request Handlers */
  const data = rest.get(mockUrl, (req, res, ctx) =>
    res(ctx.json(activeAddons)),
  );
</script>

<Meta
  title="Add-Ons / Sidebar"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={Sidebar}
/>

<Story name="Sidebar" parameters={{ msw: { handlers: [data] } }}>
  <SidebarDemo />
</Story>
