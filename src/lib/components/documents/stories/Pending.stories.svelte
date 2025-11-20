<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Pending from "../Pending.svelte";

  import pending from "@/test/fixtures/documents/pending.json";

  export const meta = {
    title: "Documents / Pending",
    component: Pending,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <Pending {pending} />
</Story>
