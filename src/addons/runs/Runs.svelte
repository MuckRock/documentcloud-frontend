<svelte:options accessors={true} />

<script lang="ts">
  import Drawer from "../Drawer.svelte";
  import EventList from "./EventList.svelte";
  import RunList from "./RunList.svelte";

  export let visible = false;

  let drawer: Drawer;
  let runs: RunList;
  let events: EventList;
  let loading: Promise<any>;

  $: if (visible && events && runs) {
    console.log("Loading runs");
    loading = Promise.all([runs.load(), events.load()]);
  }

  $: console.log(`Runs: ${visible}`);
</script>

<style>
  [slot="content"] {
    width: 50vw;
  }
</style>

<Drawer bind:this={drawer} {visible} anchor="right" on:open on:close>
  <div slot="content">
    <EventList bind:this={events} />

    <RunList bind:this={runs} />
  </div>
</Drawer>
