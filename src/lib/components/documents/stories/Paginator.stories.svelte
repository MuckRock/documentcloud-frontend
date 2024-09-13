<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import PaginatorComponent from "$lib/components/documents/Paginator.svelte";

  export const meta = {
    title: "Components / Documents / Paginator",
    component: PaginatorComponent,
    parameters: {
      layout: "centered",
    },
  };
</script>

<Story name="Paginator">
  <PaginatorComponent totalPages={100} />
</Story>
