<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import RedactionLayer, { redactions } from "../RedactionLayer.svelte";
  import Flex from "../../common/Flex.svelte";

  import redacted from "@/test/fixtures/documents/redactions.json";

  const { Story } = defineMeta({
    title: "Viewer / Redaction Layer",
    component: RedactionLayer,
    parameters: { layout: "centered" },
    render: template,
  });

  const id = "1";
</script>

<script lang="ts">
  import { onMount } from "svelte";

  onMount(() => {
    $redactions = redacted;

    return () => {
      $redactions = [];
    };
  });
</script>

{#snippet template(args)}
  <Flex class="pages" direction="column" gap={1}>
    {#each redacted as page}
      <div class="page">
        <RedactionLayer {...args} page_number={page.page_number} {id} />
      </div>
    {/each}
  </Flex>
{/snippet}

<Story name="display redactions" />

<Story name="active redactions" args={{ active: true }} />

<style>
  .page {
    position: relative;
    width: 88ch;
    aspect-ratio: 2 / 3;
    box-shadow: var(--shadow-1);
  }
</style>
