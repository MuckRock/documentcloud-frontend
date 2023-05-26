<script>
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import {loadedData} from '@/addons/fixtures/AddOnList.ts';
  import AddOnList from '@/addons/AddOnList.svelte';

  const args = {
      data: loadedData,
      loading: false,
      error: null
  }
</script>

<style>
  .container {
    max-width: 32rem;
    border: 1px solid #eee;
  }
</style>

<Meta
  title="Add-Ons / List"
  component={AddOnList}
  parameters={{layout: "centered"}} />

<Template let:args>
  <div class="container">
    <AddOnList {...args} />
  </div>
</Template>

<Story name="With Data" {args} />
<Story name="Empty" args={{...args, data: []}} />
<Story name="Loading" args={{...args, data: [], loading: true}} />
<Story name="Error" args={{...args, data: [], error: "An error occurred!"}} />
