<script lang="ts">
  import Modal from "../Modal.svelte";
  import EventList from "./EventList.svelte";
  import RunList from "./RunList.svelte";

  export let visible = false;

  let modal: Modal;
  let runs: RunList;
  let events: EventList;
  let loading: Promise<any>;

  $: if (visible && events && runs) {
    console.log("Loading runs");
    loading = Promise.all([runs.load(), events.load()]);
  }
</script>

<style>
  [slot="content"] {
    width: 50vw;
  }
</style>

<Modal bind:this={modal} {visible} anchor="right">
  <div slot="content">
    <EventList bind:this={events} />

    <RunList bind:this={runs} />
  </div>
</Modal>
