<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";

  import Mailkey from "../Mailkey.svelte";
  import { mailkey } from "@/test/fixtures/mock";

  export const meta = {
    title: "Components / Accounts / Mailkey",
    component: Mailkey,
    parameters: { layout: "fullscreen" },
  };
</script>

<Template let:args>
  <Mailkey on:close={action("close")} />
</Template>

<Story
  name="Success"
  parameters={{ msw: { handlers: [mailkey.create, mailkey.delete] } }}
/>
<Story
  name="Error"
  parameters={{ msw: { handlers: [mailkey.createError, mailkey.deleteError] } }}
/>
