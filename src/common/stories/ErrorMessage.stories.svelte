<script lang="ts" context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";

  import ErrorMessage from "../ErrorMessage.svelte";
  import Button from "../Button.svelte";

  const args = {
    message: "Something terrible happened",
  };

  export const meta = {
    title: "Common / Error Message",
    component: ErrorMessage,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <ErrorMessage {...args}>
    <Button action caution on:click={action("Click")}>Retry</Button>
  </ErrorMessage>
</Template>

<Story name="With Message" {args} />
