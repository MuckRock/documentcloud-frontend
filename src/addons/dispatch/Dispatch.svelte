<svelte:options accessors={true} />

<script lang="ts">
  import type { AddOnListItem } from "../browser/AddOnListItem.svelte";
  import Drawer from "../Drawer.svelte";
  import Header from "./Header.svelte";
  import Form from "./Form.svelte";
  import Selection from "./Selection.svelte";

  export let visible: boolean = false;
  export let addon: AddOnListItem;

  let drawer: Drawer;

  export async function open(repo: string) {}
</script>

<style></style>

<Drawer bind:this={drawer} bind:visible on:open on:close>
  <div slot="content">
    {#if addon}
      <Header {addon} />
      <Form
        properties={addon.parameters.properties}
        required={addon.parameters.required}
        eventOptions={addon.parameters.eventOptions}
      >
        <Selection slot="after" />
      </Form>
    {/if}
  </div>
</Drawer>
