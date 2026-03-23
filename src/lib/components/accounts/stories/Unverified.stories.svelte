<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Unverified from "../Unverified.svelte";

  import { me } from "@/test/fixtures/accounts";

  const { Story } = defineMeta({
    title: "Accounts / Unverified",
    component: Unverified,
    parameters: { layout: "centered" },
  });

  const user = { ...me, verified_journalist: false };
</script>

<Story name="default" args={{ user }} />
