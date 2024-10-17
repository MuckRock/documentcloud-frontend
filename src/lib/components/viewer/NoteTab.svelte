<!--
  @component
  A little tab that indicates a note. Can be small or large.
  This is just a visual element. To add behavior, wrap it in
  a link or button, as appropriate.
-->
<script lang="ts">
  import type { Access } from "$lib/api/types";
  import Tooltip from "../common/Tooltip.svelte";

  export let access: Access | "" = "";
  export let size: "small" | "normal" = "normal";
  export let title: string = undefined;
</script>

<Tooltip caption={title} placement="right">
  <div class="tab {access} {size}"></div>
</Tooltip>

<style>
  .tab {
    width: 5rem;
    height: 2rem;
    opacity: 0.8;
    background: var(--blue-3, #4294f0);
    /* mix-blend-mode: multiply; */

    /* Glare 1 */
    box-shadow: var(--glare);
  }

  .tab.small {
    width: 1rem;
    height: 0.5rem;
  }

  .tab.public {
    background: var(--note-public);
  }

  .tab.organization {
    background: var(--note-org);
  }

  .tab.private {
    background: var(--note-private);
  }
</style>
