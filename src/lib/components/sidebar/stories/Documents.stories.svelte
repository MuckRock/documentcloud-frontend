<script lang="ts" context="module">
  import type { Meta } from "@storybook/svelte";
  import { Story } from "@storybook/addon-svelte-csf";
  import Documents from "../Documents.svelte";

  export const meta: Meta = {
    title: "Navigation / Documents",
    component: Documents,
    parameters: { layout: "centered" },
  };
</script>

<Story name="Default">
  <Documents />
</Story>
