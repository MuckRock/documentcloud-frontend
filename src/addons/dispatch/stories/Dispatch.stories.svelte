<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Dispatch from "../Dispatch.svelte";
  import {
    addonsList,
    event as eventFixture,
    scheduled as klaxon,
  } from "../../../test/fixtures/addons";
  import { scheduled, send, pin } from "../../../test/handlers/addons";

  const { addon, ...event } = eventFixture;
  const addons = addonsList.results;

  let args = {
    visible: true,
    addon: null,
    event: null,
  };

  export const meta = {
    title: "Add-Ons / Dispatch",
    component: Dispatch,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Dispatch {...args} />
</Template>

<Story
  name="Success"
  args={{ visible: true, addon: klaxon.results[0].addon, event }}
  parameters={{
    msw: { handlers: [scheduled.data, send.success, pin.success] },
  }}
/>
<Story
  name="Error"
  args={{ visible: true, addon: klaxon.results[0].addon, event }}
  parameters={{ msw: { handlers: [scheduled.error, send.error, pin.error] } }}
/>
<Story
  name="Loading"
  args={{ visible: true, addon: klaxon.results[0].addon, event }}
  parameters={{
    msw: { handlers: [scheduled.loading, send.loading, pin.loading] },
  }}
/>

<Story
  name="Klaxon"
  args={{ visible: true, addon: klaxon.results[0].addon, event }}
  parameters={{
    msw: { handlers: [scheduled.loading, send.loading, pin.loading] },
  }}
/>

<Story name="PDF Exporter" args={{ ...args, addon: addons[0] }} />

<Story name="Scraper" args={{ ...args, addon: addons[1] }} />

<Story
  name="Tabula Spreadsheet Extraction"
  args={{ ...args, addon: addons[2] }}
/>

<Story
  name="Transcribe Audio, powered by Whisper"
  args={{ ...args, addon: addons[3] }}
/>

<Story name="Import Documents" args={{ ...args, addon: addons[4] }} />

<Story name="Bad Redactions" args={{ ...args, addon: addons[5] }} />

<Story name="Site Snapshot" args={{ ...args, addon: addons[6] }} />

<Story name="Translate Documents" args={{ ...args, addon: addons[7] }} />
