<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import { run } from "@/test/fixtures/addons";
  import Event from "../HistoryEvent.svelte";

  export const meta = {
    title: "Components / Add-Ons / History Event",
    component: Event,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
  };
</script>

<Template let:args>
  <Event {...args} />
</Template>

<Story name="Success" args={{ run: { ...run, status: "success" } }} />
<Story name="Failure" args={{ run: { ...run, status: "failure" } }} />
<Story name="Queued" args={{ run: { ...run, status: "queued" } }} />
<Story name="In Progress" args={{ run: { ...run, status: "in_progress" } }} />
<Story name="Unknown" args={{ run: { ...run, status: "unexpectedStatus" } }} />
<Story
  name="Premium Run"
  args={{ run: { ...run, status: "success", credits_spent: 700 } }}
/>
