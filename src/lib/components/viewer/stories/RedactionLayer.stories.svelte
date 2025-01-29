<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import RedactionLayer, { redactions } from "../RedactionLayer.svelte";
  import Flex from "../../common/Flex.svelte";

  import redacted from "@/test/fixtures/documents/redactions.json";

  export const meta = {
    title: "Components / Viewer / Redaction Layer",
    component: RedactionLayer,
    parameters: { layout: "centered" },
  };

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

<Template let:args>
  <Flex class="pages" direction="column" gap={1}>
    {#each redacted as page}
      <div class="page">
        <RedactionLayer {...args} page_number={page.page_number} {id} />
      </div>
    {/each}
  </Flex>
</Template>

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
