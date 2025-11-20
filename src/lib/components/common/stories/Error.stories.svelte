<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import { default as ErrorComponent } from "../Error.svelte";

  export const meta = {
    title: "Common / Error",
    component: ErrorComponent,
    parameters: { layout: "centered" },
  };
</script>

<Story name="Error">
  <ErrorComponent>Something has gone terribly wrong!</ErrorComponent>
</Story>
