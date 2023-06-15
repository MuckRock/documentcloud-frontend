<script lang="ts">
  import { _ } from "svelte-i18n";

  import type { Event } from "./AddOnEvent.svelte";
  import type { Run } from "./AddOnRun.svelte";

  import AddOnEvent from "./AddOnEvent.svelte";
  import AddOnRun from "./AddOnRun.svelte";
  import Modal from "../Modal.svelte";

  export let per_page = 10;
  export let visible = false;

  export let events: Event[] = [];
  export let runs: Run[] = [];

  let modal: Modal;
</script>

<style>
  [slot="content"] {
    width: 50vw;
  }
</style>

<Modal bind:this={modal} {visible} anchor="right">
  <div slot="content">
    <div class="events">
      <h2>Scheduled Add-Ons</h2>

      {#each events as event}
        <AddOnEvent {event} />
      {/each}
    </div>

    <div class="runs">
      <h2>Previous runs</h2>

      {#each runs as run}
        <AddOnRun {run} />
      {/each}
    </div>
  </div>
</Modal>
