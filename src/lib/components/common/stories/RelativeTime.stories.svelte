<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import RelativeTime from "../RelativeTime.svelte";

  const today = new Date().getDate();

  export const meta = {
    title: "Common / Relative Time",
    component: RelativeTime,
    parameters: {
      layout: "centered",
    },
  };
</script>

<Template let:args>
  <RelativeTime {...args} />
</Template>

<Story name="Day" args={{ date: new Date(new Date().setDate(today - 1)) }} />
<Story name="Week" args={{ date: new Date(new Date().setDate(today - 7)) }} />
<Story name="Month" args={{ date: new Date(new Date().setDate(today - 35)) }} />
<Story name="Year" args={{ date: new Date(new Date().setDate(today - 500)) }} />
