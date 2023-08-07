<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import ScheduledInset from "../ScheduledInset.svelte";
  import addon from "../../fixtures/addon.json";
  import klaxon from "../../fixtures/klaxon-scheduled.json";
</script>

<Meta
  title="Add-Ons / Dispatch / Scheduled Inset"
  component={ScheduledInset}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <div class="container">
    <ScheduledInset addon={args.addon} events={args.events} open />
  </div>
</Template>

<Story name="Default" args={{ addon, events: klaxon.results }} />
