<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import AddOns from "../AddOns.svelte";
  import ProcessContext from "../ProcessContext.svelte";

  import { runs } from "@/test/handlers/addons";

  export const meta = {
    title: "Processing / Running Add-Ons",
    component: AddOns,
    parameters: { layout: "centered" },
  };
</script>

<Story name="default" parameters={{ msw: { handlers: [runs.running] } }}>
  <ProcessContext>
    <AddOns />
  </ProcessContext>
</Story>
