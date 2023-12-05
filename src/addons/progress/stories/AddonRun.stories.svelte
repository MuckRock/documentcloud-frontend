<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import run from "../../fixtures/run.json";
  import AddonRun from "../AddonRun.svelte";
  import { handlers } from "./mockData";

  const args = { run, compact: false };

  export const meta = {
    title: "Add-Ons / Progress / Run",
    component: AddonRun,
  };
</script>

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
