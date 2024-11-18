<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import PremiumBadge from "../PremiumBadge.svelte";

  export const meta = {
    title: "Premium Credits / Premium Badge",
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    component: PremiumBadge,
  };
</script>

<Template>
  <PremiumBadge />
</Template>

<Story name="Default" />
