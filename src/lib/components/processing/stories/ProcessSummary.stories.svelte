<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ProcessSummary from "../ProcessSummary.svelte";

  const { Story } = defineMeta({
    title: "Processing / Process Summary",
    component: ProcessSummary,
    parameters: {
      layout: "centered",
    },
  });
</script>

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
