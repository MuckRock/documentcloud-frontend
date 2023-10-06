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

<Template let:args={addon}>
  <Premium {addon} />
</Template>

<Story name="Translate Documents" args={addons[7]} />
