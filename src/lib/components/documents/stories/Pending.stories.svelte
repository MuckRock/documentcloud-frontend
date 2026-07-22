<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Pending from "../Pending.svelte";

  import pending from "@/test/fixtures/documents/pending.json";

  const { Story } = defineMeta({
    title: "Documents / Pending",
    component: Pending,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });
</script>

<Story name="default" asChild>
  <Pending {pending} />
</Story>
