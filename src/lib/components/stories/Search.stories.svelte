<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import Search from "../Search.svelte";

  export const meta = {
    title: "Components / Search",
    component: Search,
    parameters: { layout: "centered" },
  };

  const args = {
    query: '"steve jobs" macintosh',
  };

  const change = action("Change");
  const submit = action("Submit");
</script>

<Template let:args>
  <div style="width: 24rem">
    <Search {...args} on:submit={submit} on:change={change} />
  </div>
</Template>

<Story name="With Query" {args} />
<Story name="Without Query" args={{ query: "" }} />
