<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PremiumBadge from "../PremiumBadge.svelte";

  const { Story } = defineMeta({
    title: "Premium Credits / Premium Badge",
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    component: PremiumBadge,
  });
</script>

<Story name="Default" />
