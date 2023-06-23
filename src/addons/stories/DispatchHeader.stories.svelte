<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Header from "../dispatch/Header.svelte";
  import * as addons from "../fixtures/addons.json";
</script>

<Meta
  title="Add-Ons / Dispatch header"
  component={Header}
  parameters={{ layout: "centered" }}
/>

<Template let:args={addon}>
  <Header {addon} />
</Template>

<Story name="PDF Exporter" args={addons[0]} />

<Story name="Scraper" args={addons[1]} />

<Story name="Tabula Spreadsheet Extraction" args={addons[2]} />

<Story name="Transcribe Audio, powered by Whisper" args={addons[3]} />

<Story name="Import Documents" args={addons[4]} />

<Story name="Bad Redactions" args={addons[5]} />

<Story name="Site Snapshot" args={addons[6]} />
