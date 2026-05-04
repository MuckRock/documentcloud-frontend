<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import AddOnDispatch from "../AddOnDispatch.svelte";
  import Flex from "$lib/components/common/Flex.svelte";

  import { addonsList } from "@/test/fixtures/addons";
  import { APP_URL } from "@/config/config";

  const addons = addonsList.results;

  const { Story } = defineMeta({
    title: "Forms / Add-On Dispatch",
    component: AddOnDispatch,
    parameters: { layout: "centered", chromatic: { delay: 300 } },
  });
</script>

<script lang="ts">
  import { fromStore } from "svelte/store";
  import { values } from "../AddOnDispatch.svelte";
  const currentValues = fromStore(values);
</script>

{#snippet template(args: {
  properties?: any;
  required?: string[];
  eventOptions?: any;
})}
  <Flex direction="column" style="width: 50vw">
    <AddOnDispatch
      properties={args.properties}
      required={args.required}
      eventOptions={args.eventOptions}
    />
    <div class="values" style="max-width: 88ch" data-chromatic="ignore">
      <h2><code>values</code></h2>
      <pre><code>{JSON.stringify(currentValues.current, null, 2)}</code></pre>
    </div>
  </Flex>
{/snippet}

<Story
  name="PDF Exporter"
  args={{
    properties: addons[0]?.parameters?.properties,
    required: addons[0]?.parameters?.required,
    eventOptions: addons[0]?.parameters?.eventOptions,
  }}
  {template}
/>

<Story
  name="Scraper"
  args={{
    properties: addons[1]?.parameters?.properties,
    required: addons[1]?.parameters?.required,
    eventOptions: addons[1]?.parameters?.eventOptions,
  }}
  {template}
/>

<Story
  name="Tabula Spreadsheet Extraction"
  args={{
    properties: addons[2]?.parameters?.properties,
    required: addons[2]?.parameters?.required,
    eventOptions: addons[2]?.parameters?.eventOptions,
  }}
  {template}
/>

<Story
  name="Transcribe Audio, powered by Whisper"
  args={{
    properties: addons[3]?.parameters?.properties,
    required: addons[3]?.parameters?.required,
    eventOptions: addons[3]?.parameters?.eventOptions,
  }}
  {template}
/>

<Story
  name="Import Documents"
  args={{
    properties: addons[4]?.parameters?.properties,
    required: addons[4]?.parameters?.required,
    eventOptions: addons[4]?.parameters?.eventOptions,
  }}
  {template}
/>

<Story
  name="Bad Redactions"
  args={{
    properties: addons[5]?.parameters?.properties,
    required: addons[5]?.parameters?.required,
    eventOptions: addons[5]?.parameters?.eventOptions,
  }}
  {template}
/>

<Story
  name="Site Snapshot"
  args={{
    properties: addons[6]?.parameters?.properties,
    required: addons[6]?.parameters?.required,
    eventOptions: addons[6]?.parameters?.eventOptions,
  }}
  {template}
/>

<Story
  name="Prefill Fields (Scraper)"
  args={{
    properties: addons[1]?.parameters?.properties,
    required: addons[1]?.parameters?.required,
    eventOptions: addons[1]?.parameters?.eventOptions,
  }}
  {template}
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

<Story
  name="Signed Out"
  args={{
    properties: addons[4]?.parameters?.properties,
    required: addons[4]?.parameters?.required,
    eventOptions: addons[4]?.parameters?.eventOptions,
  }}
  {template}
  parameters={{ signedOut: true }}
/>
