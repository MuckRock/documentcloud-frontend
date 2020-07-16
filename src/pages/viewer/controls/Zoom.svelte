<script>
  import { doc, zoomBreakpoints } from "@/viewer/document";

  // SVG assets
  import plusSvg from "@/assets/viewer_plus.svg";
  import minusSvg from "@/assets/viewer_minus.svg";

  let select;

  function roundBreakpoint(percent, zoomIn) {
    for (
      let i = zoomIn ? 0 : zoomBreakpoints.length - 1;
      zoomIn ? i < zoomBreakpoints.length : i >= 0;
      i += zoomIn ? 1 : -1
    ) {
      if (
        zoomIn
          ? percent + 2 < zoomBreakpoints[i]
          : percent - 2 > zoomBreakpoints[i]
      ) {
        return zoomBreakpoints[i];
      }
    }
    return zoomBreakpoints[zoomIn ? zoomBreakpoints.length - 1 : 0];
  }

  function scale(percent) {
    if (doc.scrollzoom != null) {
      doc.scrollzoom.scaleTo(percent / 100);
      doc.updateScrollZoom();
    }
  }

  function zoomIn() {
    scale(roundBreakpoint(doc.scrollzoom.transform.matrix[0] * 100, true));
  }

  function zoomOut() {
    scale(roundBreakpoint(doc.scrollzoom.transform.matrix[0] * 100, false));
  }

  function handleChange(e) {
    const zoom = e.target.value;
    if (zoom == "default") return;
    if (zoom == "width") {
      // Zoom width
      if (doc.scrollzoom != null) {
        scale(
          (doc.scrollzoom.bounds.width / doc.scrollzoom.containerWidth) * 100
        );
      }
    } else if (zoom == "height") {
      // Zoom height
      if (doc.scrollzoom != null) {
        const page = doc.visiblePageNumber - 1;
        scale(
          (doc.scrollzoom.bounds.height /
            doc.scrollzoom.components[page].height) *
            100
        );
        setTimeout(() => doc.jumpToPage(page), 0);
      }
    } else {
      const value = parseFloat(zoom);
      if (value != null && !isNaN(value)) {
        scale(value);
      }
    }

    select.value = "default";
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

    &.disabled {
      pointer-events: none;
      visibility: hidden;
    }
  }
</style>

<span class="zoom" class:disabled={$doc.mode != 'image'}>
  <span class="icon" on:click={zoomIn}>
    {@html plusSvg}
  </span>
  <div class="separator" />
  <span class="icon" on:click={zoomOut}>
    {@html minusSvg}
  </span>

  <select bind:this={select} on:change={handleChange}>
    <option value="default">{($doc.viewerScale * 100).toFixed()}%</option>
    <option disabled>---</option>
    <option value="width">Fit width</option>
    <option value="height">Fit height</option>
    <option value="50">50%</option>
    <option value="100">100%</option>
    <option value="150">150%</option>
    <option value="200">200%</option>
    <option value="400">400%</option>
  </select>
</span>
