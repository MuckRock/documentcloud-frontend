<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Unverified from "../Unverified.svelte";

  import { me } from "@/test/fixtures/accounts";

  export const meta = {
    title: "Accounts / Unverified",
    component: Unverified,
    parameters: { layout: "centered" },
  };

  const user = { ...me, verified_journalist: false };
</script>

<Story name="default">
  <Unverified {user} />
</Story>
