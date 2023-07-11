<script lang="ts">
  import type { AddOnListItem } from "../browser/AddOnListItem.svelte";
  import Modal from "../Modal.svelte";
  import Header from "./Header.svelte";
  import Form from "./Form.svelte";
  import Selection from "./Selection.svelte";

  export let visible: boolean = false;
  export let addon: AddOnListItem;

  let modal: Modal;
</script>

<style></style>

<Modal bind:this={modal} {visible}>
  <Header slot="header" {addon} />

  <Form
    slot="content"
    properties={addon.parameters.properties}
    required={addon.parameters.required}
    eventOptions={addon.parameters.eventOptions}
  >
    <Selection slot="after" />
  </Form>
</Modal>
