<script module lang="ts">
  import { _ } from "svelte-i18n";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import UpgradePrompt from "../UpgradePrompt.svelte";

  const args = {
    message:
      "This Premium Add-On uses AI to perform advanced analysis. Upgrade to a Professional account to utilize this and other powerful Add-Ons.",
    callToAction: "Start Free Trial",
  };

  const { Story } = defineMeta({
    title: "Premium Credits / Upgrade Prompt",
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    component: UpgradePrompt,
  });
</script>

<Story name="Upgrade Prompt" {args} />

<Story name="Hidden Action" args={{ ...args, callToAction: null }} />
