<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import AddOns, { running } from "../AddOns.svelte";

  import { runs } from "@/test/handlers/addons";

  export const meta = {
    title: "Components / Processing / Running Add-Ons",
    component: AddOns,
    parameters: { layout: "centered" },
  };
</script>

<script lang="ts">
  import { progress } from "@/test/fixtures/addons/progress";

  $running = progress;
</script>

<Story name="default" parameters={{ msw: { handlers: [runs.running] } }}>
  <AddOns />
</Story>
