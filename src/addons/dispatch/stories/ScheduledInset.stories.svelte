<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import ScheduledInset from "../ScheduledInset.svelte";
  import addon from "../../fixtures/addon.json";
  import klaxon from "../../fixtures/klaxon-scheduled.json";

  export const meta = {
    title: "Add-Ons / Dispatch / Scheduled Inset",
    component: ScheduledInset,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <ScheduledInset addon={args.addon} events={args.events} open />
</Template>

<Story name="Default" args={{ addon, events: klaxon.results }} />
