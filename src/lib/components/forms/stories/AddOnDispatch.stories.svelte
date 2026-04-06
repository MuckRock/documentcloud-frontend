<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import AddOnDispatch, { values } from "../AddOnDispatch.svelte";
  import Flex from "$lib/components/common/Flex.svelte";

  import { addonsList } from "@/test/fixtures/addons";
  import { APP_URL } from "@/config/config";

  const addons = addonsList.results;

  const { Story } = defineMeta({
    title: "Forms / Add-On Dispatch",
    component: AddOnDispatch,
    parameters: { layout: "centered" },
    render: template,
  });
</script>

{#snippet template(args)}
  {@const addon = args}
  <Flex direction="column" style="width: 50vw">
    <AddOnDispatch
      properties={addon.properties}
      required={addon.required}
      eventOptions={addon.eventOptions}
    />
  </Flex>
{/snippet}

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

<Story name="Signed Out" args={addons[4]} parameters={{ signedOut: true }} />
