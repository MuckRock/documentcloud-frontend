<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Form, { values } from "../Form.svelte";

  import { addonsList } from "../../../test/fixtures/addons";

  const addons = addonsList.results;

  export const meta = {
    title: "Add-Ons / Dispatch / Form",
    component: Form,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args={addon}>
  <h2>{addon.name}</h2>
  <Form
    on:input
    on:change
    on:submit
    on:reset
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
