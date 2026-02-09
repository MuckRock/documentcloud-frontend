<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AddOns from "../AddOns.svelte";
  import ProcessContext from "../ProcessContext.svelte";

  import { runs } from "@/test/handlers/addons";

  const { Story } = defineMeta({
    title: "Processing / Running Add-Ons",
    component: AddOns,
    parameters: { layout: "centered" },
  });
</script>

<Story
  name="default"
  parameters={{ msw: { handlers: [runs.running] } }}
  asChild
>
  <ProcessContext>
    <AddOns />
  </ProcessContext>
</Story>
