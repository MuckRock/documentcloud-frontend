<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import { event } from "@/test/fixtures/addons";
  import Event from "../ScheduledEvent.svelte";

  export const meta = {
    title: "Components / Add-Ons / Scheduled Event",
    component: Event,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
  };
</script>

<Template let:args>
  <Event {...args} />
</Template>

<Story name="Disabled" args={{ event: { ...event, event: 0 } }} />
<Story name="Hourly" args={{ event: { ...event, event: 1 } }} />
<Story name="Daily" args={{ event: { ...event, event: 2 } }} />
<Story name="Weekly" args={{ event: { ...event, event: 3 } }} />
<Story name="On Upload" args={{ event: { ...event, event: 4 } }} />
<Story
  name="Full Width"
  parameters={{ layout: "fullscreen" }}
  args={{ event: { ...event, event: 2 } }}
/>
