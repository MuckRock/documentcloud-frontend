<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Dispatch from "../dispatch/Dispatch.svelte";
  import * as addons from "../fixtures/addons.json";

  import { layout } from "../../manager/layout.js";
  import { search } from "../../search/search.js";

  let args = {
    visible: true,
    addon: null,
  };
</script>

<Meta
  title="Add-Ons / Dispatch"
  component={Dispatch}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <Dispatch visible={args.visible} addon={args.addon} />
</Template>

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
