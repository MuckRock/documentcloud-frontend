<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import AddOns, { running } from "../AddOns.svelte";

  import { progress as handlers } from "@/test/handlers/addons";

  export const meta = {
    title: "Components / Processing / Running Add-Ons",
    component: AddOns,
    parameters: { layout: "centered" },
  };
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { progress } from "@/test/fixtures/addons/progress";

  onMount(() => {
    $running = progress;

    return () => {
      $running = [];
    };
  });
</script>

<Story name="default" parameters={{ msw: { handlers } }}>
  <AddOns />
</Story>
