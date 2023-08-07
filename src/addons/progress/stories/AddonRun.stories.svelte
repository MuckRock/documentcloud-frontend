<script>
  import { rest } from "msw";
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import run from "../../fixtures/run.json";
  import { baseApiUrl } from "../../../api/base";
  import AddonRun from "../AddonRun.svelte";

  const args = { run, compact: false };

  const mockUpdateUrl = new URL("/api/addon_runs/:run/", baseApiUrl).toString();
  const handlers = [
    rest.patch(mockUpdateUrl, async (req, res, ctx) => {
      const body = await req.json();
      console.log(JSON.stringify(body));
      return res(ctx.json({ ...run, ...body }));
    }),
    rest.delete(mockUpdateUrl, (req, res, ctx) => res(ctx.json({}))),
  ];
</script>

<Meta title="Add-Ons / Progress / Run" component={AddonRun} />

<Template let:args>
  <AddonRun {...args} />
</Template>

<Story name="Expanded" {args} parameters={{ msw: { handlers } }} />
<Story
  name="Compact"
  args={{ ...args, compact: true }}
  parameters={{ msw: { handlers } }}
/>
<Story
  name="In Progress"
  args={{
    ...args,
    run: { ...run, status: "in_progress", message: "Scraping…" },
  }}
  parameters={{ msw: { handlers } }}
/>
<Story
  name="Failure"
  args={{
    ...args,
    run: { ...run, status: "failure", message: "Failed to scrape" },
  }}
  parameters={{ msw: { handlers } }}
/>
<Story
  name="Queued"
  args={{
    ...args,
    run: { ...run, status: "queued", message: "Waiting to scrape…" },
  }}
  parameters={{ msw: { handlers } }}
/>
