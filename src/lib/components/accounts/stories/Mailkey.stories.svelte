<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import Mailkey from "../Mailkey.svelte";
  import { mailkey } from "@/test/handlers/accounts";

  const { Story } = defineMeta({
    title: "Accounts / Mailkey",
    component: Mailkey,
    parameters: { layout: "fullscreen" },
  });
</script>

<Story
  name="Success"
  parameters={{ msw: { handlers: [mailkey.create, mailkey.delete] } }}
/>

<Story
  name="Error"
  parameters={{ msw: { handlers: [mailkey.createError, mailkey.deleteError] } }}
/>
