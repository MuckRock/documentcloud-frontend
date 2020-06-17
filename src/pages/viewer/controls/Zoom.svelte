<script>
  import {
    ZOOM_OPTIONS,
    renderer,
    zoomFit,
    zoomPercent,
    zoomIn,
    zoomOut
  } from "@/viewer/renderer";

  // SVG assets
  import plusSvg from "@/assets/viewer_plus.svg";
  import minusSvg from "@/assets/viewer_minus.svg";

  function handleChange(e) {
    const zoom = e.target.value;

    if (zoom == ZOOM_OPTIONS[0]) {
      zoomFit();
    } else {
      const percent = parseFloat(zoom) / 100;
      if (percent != null && !isNaN(percent)) {
        zoomPercent(percent);
      }
    }
  }
</script>

<style lang="scss">
  .zoom {
    vertical-align: middle;
    line-height: 0;
    user-select: none;

    > *,
    :global(svg) {
      display: inline-block !important;
      vertical-align: middle;
    }

    .icon {
      @include buttonLike;
      padding: 10px 6px;
    }

    .separator {
      height: 18px;
      border: 0.5px solid rgba(0, 0, 0, 0.2);
    }

    select {
      margin: 0 0 0 5px;
    }
  }
</style>

<span class="zoom">
  <span class="icon" on:click={zoomIn}>
    {@html plusSvg}
  </span>
  <div class="separator" />
  <span class="icon" on:click={zoomOut}>
    {@html minusSvg}
  </span>

  <select bind:value={$renderer.zoom} on:blur={handleChange}>
    {#each ZOOM_OPTIONS as option}
      <option value={option}>{option}</option>
    {/each}
  </select>
</span>
