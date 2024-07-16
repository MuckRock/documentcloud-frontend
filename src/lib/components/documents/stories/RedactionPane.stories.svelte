<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import RedactionPane, { redactions } from "../RedactionPane.svelte";
  import Flex from "../../common/Flex.svelte";

  import redacted from "$lib/api/fixtures/documents/redactions.json";

  export const meta = {
    title: "Components / Documents / Redaction pane",
    component: RedactionPane,
    parameters: { layout: "centered" },
  };
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
        <RedactionPane {...args} page_number={page.page_number} />
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
