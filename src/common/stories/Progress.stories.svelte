<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Progress from "../Progress.svelte";

  const args = {
    progress: 0.5,
    initializing: false,
    compact: false,
    failure: false,
  };
</script>

<Meta
  title="Common / Progress"
  component={Progress}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <Progress {...args} />
</Template>

<Story name="Default" {args} />
<Story name="Initializing" args={{ ...args, initializing: true }} />
<Story name="Compact" args={{ ...args, compact: true }} />
<Story name="Failure" args={{ ...args, failure: true }} />
