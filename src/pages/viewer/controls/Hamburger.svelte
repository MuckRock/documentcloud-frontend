<script>
  // SVG assets
  import { ThreeBars16 } from "svelte-octicons";
</script>

<button class="hamburger plausible-event-name=viewer-hamburger" on:click>
  <ThreeBars16 />
</button>

<style>
  .hamburger {
    background: none;
    border: none;
    cursor: pointer;
    margin: 0.5em;
  }
</style>
