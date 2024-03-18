<svelte:options accessors={true} />

<script lang="ts">
  import { _ } from "svelte-i18n";

  import Scheduled from "@/addons/runs/Scheduled.svelte";
  import History from "@/addons/runs/History.svelte";
</script>

<div id="runs">
  <h2>{$_("addonRuns.scheduled")}</h2>
  <Scheduled />
  <h2>{$_("addonRuns.previous")}</h2>
  <History />
</div>

<style>
  #runs {
    max-width: 88ch;
  }

  h2 {
    font-size: 1.25em;
    margin: 1rem 0 0 1rem;
    padding: 0 0 0.5rem 0;
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  }
</style>
