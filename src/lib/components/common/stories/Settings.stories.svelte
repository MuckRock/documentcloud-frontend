<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { writable } from "svelte/store";

  import Settings from "../Settings.svelte";
  import { createEmbedSearchParams } from "$lib/utils/embed";
  import {
    documentSettings,
    documentDefaults,
    projectSettings,
    projectDefaults,
  } from "$lib/utils/embedConfig";

  const { Story } = defineMeta({
    title: "Common / Settings",
    component: Settings,
    parameters: { layout: "centered" },
  });

  // each story binds the config to its own store so changes are reflected live
  const documentValues = writable({ ...documentDefaults });
  const projectValues = writable({ ...projectDefaults });
</script>

<Story name="Document embed">
  {#snippet template()}
    <pre><code
        >{createEmbedSearchParams($documentValues, documentDefaults)}</code
      ></pre>
    <Settings settings={documentSettings} values={documentValues} />
  {/snippet}
</Story>

<Story name="Project embed">
  {#snippet template()}
    <pre><code>{createEmbedSearchParams($projectValues, projectDefaults)}</code
      ></pre>
    <Settings settings={projectSettings} values={projectValues} />
  {/snippet}
</Story>
