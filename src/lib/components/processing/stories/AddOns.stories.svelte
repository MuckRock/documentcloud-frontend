<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import AddOns from "../AddOns.svelte";
  import { progress } from "@/test/fixtures/addons/progress";
  import ProcessContext from "../ProcessContext.svelte";
  import { writable } from "svelte/store";

  import { runs } from "@/test/handlers/addons";

  export const meta = {
    title: "Components / Processing / Running Add-Ons",
    component: AddOns,
    parameters: { layout: "centered" },
  };
</script>

<Story name="default" parameters={{ msw: { handlers: [runs.running] } }}>
  <ProcessContext addons={writable(progress)}>
    <AddOns />
  </ProcessContext>
</Story>
