<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Header from "../Header.svelte";

  import * as addons from "../../fixtures/addons.json";

  export const meta = {
    title: "Add-Ons / Dispatch / Header",
    component: Header,
    parameters: { layout: "centered" },
    argTypes: { categories: { control: "object" } },
  };
</script>

<Template let:args={addon}>
  <div class="container">
    <Header {addon} />
  </div>
</Template>

<Story name="PDF Exporter" args={addons[0]} />

<Story name="Scraper" args={addons[1]} />

<Story name="Tabula Spreadsheet Extraction" args={addons[2]} />

<Story name="Transcribe Audio, powered by Whisper" args={addons[3]} />

<Story name="Import Documents" args={addons[4]} />

<Story name="Bad Redactions" args={addons[5]} />

<Story name="Site Snapshot" args={addons[6]} />

<style>
  .container {
    max-width: 32rem;
    margin: 0 auto;
  }
</style>
