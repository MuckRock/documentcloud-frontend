<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import run from "../../fixtures/run.json";
  import Event from "../HistoryEvent.svelte";

  const args = { run };
</script>

<Meta
  title="Add-Ons / Runs / History / Event"
  component={Event}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <Event {...args} />
</Template>

<Story name="Success" args={{ run: { ...run, status: "success" } }} />
<Story name="Failure" args={{ run: { ...run, status: "failure" } }} />
<Story name="Queued" args={{ run: { ...run, status: "queued" } }} />
<Story name="In Progress" args={{ run: { ...run, status: "in_progress" } }} />
<Story name="Unknown" args={{ run: { ...run, status: "unexpectedStatus" } }} />
