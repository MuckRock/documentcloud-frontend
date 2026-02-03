<script module lang="ts">
  import type { ComponentProps } from "svelte";
  import type { Document } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import EditDataMany from "../EditDataMany.svelte";

  import doc from "@/test/fixtures/documents/examples/the-santa-anas.json";

  const document = doc as Document;

  const { Story } = defineMeta({
    title: "Forms / Edit data",
    parameters: { layout: "centered" },
    component: EditDataMany,
  });

  type Args = ComponentProps<typeof EditDataMany>;
</script>

{#snippet template(args: Args)}
  <div class="wrap">
    <EditDataMany {...args} />
  </div>
{/snippet}

<Story name="one document" args={{ documents: [document] }} {template} />

<Story
  name="many documents"
  args={{ documents: [document, document] }}
  {template}
/>

<Story
  name="too many documents"
  args={{ documents: Array(100).fill(document) }}
  {template}
/>

<Story
  name="Empty data"
  args={{ documents: [{ ...document, data: {} }] }}
  {template}
/>

<style>
  .wrap {
    max-width: 80ch;
  }
</style>
