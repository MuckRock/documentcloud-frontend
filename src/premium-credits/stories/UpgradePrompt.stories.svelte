<script>
  import { _ } from "svelte-i18n";
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import UpgradePrompt from "../UpgradePrompt.svelte";

  const args = {
    message:
      "This Premium Add-On uses AI to perform advanced analysis. Upgrade to a Professional account to utilize this and other powerful Add-Ons.",
    callToAction: "Start Free Trial",
  };
</script>

<Meta
  title="Premium Credits / Upgrade Prompt"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={UpgradePrompt}
/>

<Template let:args>
  <UpgradePrompt {...args} />
</Template>

<Story name="Upgrade Prompt" id="upgradePrompt" {args} />

<Story name="Hidden Action" args={{ ...args, callToAction: null }} />
