<svelte:options accessors={true} />

<script lang="ts">
  import { _ } from "svelte-i18n";

  import Drawer from "../../common/Drawer.svelte";
  import Scheduled from "./Scheduled.svelte";
  import History from "./History.svelte";

  export let visible = false;

  let drawer: Drawer;
</script>

<Drawer bind:this={drawer} {visible} anchor="right" on:open on:close>
  <div slot="content">
    <h2>{$_("addonRuns.scheduled")}</h2>
    <Scheduled />
    <h2>{$_("addonRuns.previous")}</h2>
    <History />
  </div>
</Drawer>

<style>
  [slot="content"] {
    width: 60ch;
  }
  h2 {
    font-size: 1.25em;
    margin: 1rem 0 0 1rem;
    padding: 0 0 0.5rem 0;
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  }
</style>
