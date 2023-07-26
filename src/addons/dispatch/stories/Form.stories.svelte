<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Form, { values } from "../Form.svelte";
  import * as addons from "../../fixtures/addons.json";

  let form;
</script>

<Meta
  title="Add-Ons / Form"
  component={Form}
  parameters={{ layout: "centered" }}
/>

<Template let:args={addon}>
  <h2>{addon.name}</h2>

  <Form
    bind:this={form}
    properties={addon.parameters.properties}
    required={addon.parameters.required}
    eventOptions={addon.parameters.eventOptions}
  />

  <div class="values">
    <h2>Data</h2>
    <code>
      {JSON.stringify($values, null, 2)}
    </code>
  </div>
</Template>

<Story name="PDF Exporter" args={addons[0]} />

<Story name="Scraper" args={addons[1]} />

<Story name="Tabula Spreadsheet Extraction" args={addons[2]} />

<Story name="Transcribe Audio, powered by Whisper" args={addons[3]} />

<Story name="Import Documents" args={addons[4]} />

<Story name="Bad Redactions" args={addons[5]} />

<Story name="Site Snapshot" args={addons[6]} />
