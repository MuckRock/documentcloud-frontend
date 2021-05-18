<script>
  export let note;
  export let active = false;
</script>

<style lang="scss">
  .dc-embed-note {
    display: inline-block;
    position: absolute;
    background: rgba(255, 255, 0, 0.2);
    cursor: pointer;

    &:hover {
      box-shadow: 1px 2px 7px rgba(0, 0, 0, 0.2);
    }

    &.public {
      border: $annotationBorderWidth solid $annotationBorder;
      background: rgba($annotationBorder, 0.2);
    }

    &.organization {
      border: $annotationBorderWidth solid $organizationAnnotation;
      background: rgba($organizationAnnotation, 0.2);
    }

    &.private {
      border: $annotationBorderWidth solid $privateAnnotation;
      background: rgba($privateAnnotation, 0.2);
    }

    &.active {
      background: transparent;
      border: none;
      box-shadow: 1px 2px 7px rgba(0, 0, 0, 0.2);
    }
  }
</style>

<div
  class="dc-embed-note"
  class:public={note.access == "public"}
  class:organization={note.access == "organization"}
  class:private={note.access == "private"}
  class:active
  style="left: {note.x1 * 100}%; top: {note.y1 * 100}%; right: {(1 - note.x2) *
    100}%;
  bottom: {(1 - note.y2) * 100}%"
  on:click
/>
