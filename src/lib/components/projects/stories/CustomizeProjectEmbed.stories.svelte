<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CustomizeProjectEmbed, {
    embedSettings,
  } from "../CustomizeProjectEmbed.svelte";
  import { createEmbedSearchParams } from "$lib/utils/embed";
  import { projectDefaults } from "$lib/utils/embedConfig";

  const { Story } = defineMeta({
    title: "Projects / Customize Embed",
    component: CustomizeProjectEmbed,
    parameters: { layout: "centered" },
  });
</script>

<Story name="Default">
  {#snippet template()}
    <pre>
      <code>
        {createEmbedSearchParams($embedSettings, projectDefaults)}
      </code>
    </pre>
    <CustomizeProjectEmbed />
  {/snippet}
</Story>
