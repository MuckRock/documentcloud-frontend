<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Premium from "../Premium.svelte";

  import * as addons from "../../fixtures/addons.json";
</script>

<Meta
  title="Add-Ons / Dispatch / Premium"
  component={Premium}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <Premium {...args} />
</Template>

<Story name="With Premium User" args={{ addon: addons[7] }} />
<Story name="Without Credits" args={{ addon: addons[7], creditBalance: 0 }} />
<Story
  name="With Free User"
  args={{ addon: addons[7], isPremiumUser: false }}
/>
