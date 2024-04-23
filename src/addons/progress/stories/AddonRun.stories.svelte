<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import AddonRun from "../AddonRun.svelte";
  import { run } from "../../../test/fixtures/addons";
  import { progress as handlers } from "../../../test/handlers/addons";

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
