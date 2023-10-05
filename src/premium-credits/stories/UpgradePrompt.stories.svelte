<script>
  import { _ } from "svelte-i18n";
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import UpgradePrompt from "../UpgradePrompt.svelte";
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

<Story
  name="Upgrade Prompt"
  args={{
    message:
      "This Premium Add-On uses AI to perform advanced analysis. Upgrade to a Professional account to utilize this and other powerful Add-Ons.",
    callToAction: "Start Free Trial",
  }}
/>
