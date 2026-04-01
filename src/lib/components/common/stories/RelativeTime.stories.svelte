<script context="module" lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import RelativeTime from "../RelativeTime.svelte";

  const today = new Date().getDate();

  const { Story } = defineMeta({
    title: "Common / Relative Time",
    component: RelativeTime,
    parameters: {
      layout: "centered",
    },
    render: template,
  });
</script>

{#snippet template(args)}
  <RelativeTime {...args} />
{/snippet}

<Story name="Day" args={{ date: new Date(new Date().setDate(today - 1)) }} />
<Story name="Week" args={{ date: new Date(new Date().setDate(today - 7)) }} />
<Story name="Month" args={{ date: new Date(new Date().setDate(today - 35)) }} />
<Story name="Year" args={{ date: new Date(new Date().setDate(today - 500)) }} />
