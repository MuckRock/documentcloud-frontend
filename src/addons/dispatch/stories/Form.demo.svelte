<script>
  import Form, { values } from "../Form.svelte";

  export let addon;
</script>

<h2>{addon.name}</h2>

<Form
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
