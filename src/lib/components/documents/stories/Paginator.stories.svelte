<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Paginator from "$lib/components/documents/Paginator.svelte";

  export const meta = {
    title: "Viewer / Paginator",
    component: Paginator,
    parameters: {
      layout: "centered",
    },
  };
</script>

<Story name="default">
  <Paginator totalPages={100} />
</Story>
