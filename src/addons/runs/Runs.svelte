<script lang="ts">
  import Modal from "../Modal.svelte";
  import EventList from "./EventList.svelte";
  import RunList from "./RunList.svelte";

  export let visible = false;

  let modal: Modal;
</script>

<style>
  [slot="content"] {
    width: 50vw;
  }
</style>

<Modal bind:this={modal} {visible} anchor="right">
  <div slot="content">
    <EventList />

    <RunList />
  </div>
</Modal>
