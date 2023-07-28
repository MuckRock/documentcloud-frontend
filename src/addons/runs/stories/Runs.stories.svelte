<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import Runs from "../Runs.svelte";
  
  import {handlers as historyHandlers} from './History.stories.svelte';
  import {handlers as scheduledHandlers} from './Scheduled.stories.svelte';

  const args = { visible: true };
</script>

<Meta
  title="Add-Ons / Runs"
  tags={["autodocs"]}
  parameters={{ layout: "fullscreen" }}
  component={Runs}
/>

<Template let:args>
  <Runs {...args} />
</Template>

<Story name="Success" {args} parameters={{ msw: { handlers: [historyHandlers.data, scheduledHandlers.data] } }} />
<Story name="Loading" {args} parameters={{ msw: { handlers: [historyHandlers.loading, scheduledHandlers.loading] } }} />
<Story name="Error" {args} parameters={{ msw: { handlers: [historyHandlers.error, scheduledHandlers.error] } }} />
<Story name="Empty" {args} parameters={{ msw: { handlers: [historyHandlers.empty, scheduledHandlers.empty] } }} />
