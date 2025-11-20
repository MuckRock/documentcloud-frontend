<script lang="ts" context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import type { Meta } from "@storybook/svelte";
  import ProcessSummary from "../ProcessSummary.svelte";

  export const meta: Meta = {
    title: "Processing / Process Summary",
    component: ProcessSummary,
    parameters: {
      layout: "centered",
    },
  };
</script>

<Template let:args>
  <ProcessSummary {...args} />
</Template>

<Story name="With None" args={{ counts: {} }} />
<Story
  name="With Some"
  args={{ counts: { success: 2, failure: 1, in_progress: 1 } }}
/>
<Story
  name="With All"
  args={{
    counts: { success: 2, failure: 1, in_progress: 1, queued: 2, cancelled: 1 },
  }}
/>
