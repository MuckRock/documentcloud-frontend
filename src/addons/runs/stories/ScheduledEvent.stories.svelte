<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import event from "../../fixtures/event.json";
  import Event from "../ScheduledEvent.svelte";

  export const meta = {
    title: "Add-Ons / Runs / Scheduled / Event",
    component: Event,
    parameters: { layout: "centered" },
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
