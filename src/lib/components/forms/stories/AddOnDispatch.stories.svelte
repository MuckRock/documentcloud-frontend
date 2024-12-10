<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import AddOnDispatch, { values } from "../AddOnDispatch.svelte";
  import Flex from "$lib/components/common/Flex.svelte";

  import { addonsList } from "@/test/fixtures/addons";
  import { APP_URL } from "@/config/config";

  const addons = addonsList.results;

  export const meta = {
    title: "Forms / Add-On Dispatch",
    component: AddOnDispatch,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args={addon}>
  <Flex direction="column" style="width: 50vw">
    <AddOnDispatch
      on:input
      on:change
      on:submit
      on:reset
      properties={addon.parameters.properties}
      required={addon.parameters.required}
      eventOptions={addon.parameters.eventOptions}
    />
    <div class="values" style="max-width: 88ch" data-chromatic="ignore">
      <h2><code>$values</code></h2>
      <pre><code>{JSON.stringify($values, null, 2)}</code></pre>
    </div>
  </Flex>
</Template>

<Story name="PDF Exporter" args={addons[0]} />

<Story name="Scraper" args={addons[1]} />

<Story name="Tabula Spreadsheet Extraction" args={addons[2]} />

<Story name="Transcribe Audio, powered by Whisper" args={addons[3]} />

<Story name="Import Documents" args={addons[4]} />

<Story name="Bad Redactions" args={addons[5]} />

<Story name="Site Snapshot" args={addons[6]} />

<Story
  name="Prefill Fields (Scraper)"
  args={addons[1]}
  parameters={{
    sveltekit_experimental: {
      stores: {
        page: {
          url: new URL(
            "/?site=https://example.com&project=123&keywords=foo,bar&notAfield=hahagotya",
            APP_URL,
          ),
        },
      },
    },
  }}
/>
