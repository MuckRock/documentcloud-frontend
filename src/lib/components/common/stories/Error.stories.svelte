<script context="module" lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { default as ErrorComponent } from "../Error.svelte";

  const { Story } = defineMeta({
    title: "Common / Error",
    component: ErrorComponent,
    parameters: { layout: "centered" },
  });
</script>

<Story name="Error">
  <ErrorComponent>Something has gone terribly wrong!</ErrorComponent>
</Story>
