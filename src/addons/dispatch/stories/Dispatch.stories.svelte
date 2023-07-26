<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Dispatch from "../Dispatch.svelte";
  import * as addons from "../../fixtures/addons.json";
  import * as eventFixture from "../../fixtures/event.json";

  const { addon: klaxon, ...event } = eventFixture;

  let args = {
    visible: true,
    addon: null,
    event: null,
  };
</script>

<Meta
  title="Add-Ons / Dispatch"
  component={Dispatch}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <Dispatch {...args} />
</Template>

<Story name="Klaxon" args={{ visible: true, addon: klaxon, event }} />

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
