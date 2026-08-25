<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CustomizeEmbed, { embedSettings } from "../CustomizeEmbed.svelte";
  import { createEmbedSearchParams } from "$lib/utils/embed";
  import { documentDefaults } from "$lib/utils/embedConfig";

  const { Story } = defineMeta({
    title: "Documents / Customize Embed",
    component: CustomizeEmbed,
    parameters: { layout: "centered" },
  });
</script>

<Story name="Default">
  {#snippet template()}
    <pre>
      <code>
        {createEmbedSearchParams($embedSettings, documentDefaults)}
      </code>
    </pre>
    <CustomizeEmbed />
  {/snippet}
</Story>
