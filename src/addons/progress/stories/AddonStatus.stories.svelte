<script>
  import { rest } from "msw";
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import runList from "../../fixtures/run-list.json";
  import { baseApiUrl } from "../../../api/base";
  import AddonStatus from "../AddonStatus.svelte";

  const args = {};

  const mockListUrl = new URL("/api/addon_runs/", baseApiUrl).toString();
  const mockUpdateUrl = new URL("/api/addon_runs/:run", baseApiUrl).toString();
  const handlers = [
    rest.get(mockListUrl, (req, res, ctx) => res(ctx.json(runList))),
    rest.patch(mockUpdateUrl, async (req, res, ctx) => {
      const body = await req.json();
      console.log(JSON.stringify(body));
      return res(ctx.json({ ...run, ...body }));
    }),
    rest.delete(mockUpdateUrl, (req, res, ctx) => res(ctx.json({}))),
  ];
</script>

<Meta title="Add-Ons / Progress / Status" component={AddonStatus} />

<Template let:args>
  <AddonStatus {...args} />
</Template>

<Story name="Status" {args} parameters={{ msw: { handlers } }} />
