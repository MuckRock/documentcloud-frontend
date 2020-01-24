<script>
  import Image from "@/common/Image";
  import Button from "@/common/Button";
  import { pageImageUrl } from "@/api/viewer";
  import { cancelActions } from "@/viewer/layout";

  // SVG assets
  import closeInlineSvg from "@/assets/close_inline.svg";

  export let document;
  export let annotation;
  export let aspect;
</script>

<style lang="scss">
  $annotationBg: white;
  $border: solid $annotationBorderWidth $annotationBorder;
  $padding: 10px;
  $insetMargin: 1px;

  .annotation {
    position: absolute;
    background: gainsboro;
    left: 0;
    right: 0;

    .excerpt {
      overflow: hidden;
      height: 100%;
      margin: (-$padding - $insetMargin)
        (-$padding - $annotationBorderWidth - $insetMargin);
      border-left: solid ($padding + $annotationBorderWidth) $annotationBg;
      border-right: solid ($padding + $annotationBorderWidth) $annotationBg;
      border-top: solid $padding $annotationBg;
      border-bottom: solid $padding $annotationBg;
      background: $annotationBg;

      &::before {
        content: "";
        position: absolute;
        top: -$padding - $insetMargin;
        left: -$padding - $insetMargin - $annotationBorderWidth;
        right: -$padding - $insetMargin - $annotationBorderWidth;
        bottom: -$padding + $insetMargin;
        border-left: $border;
        border-right: $border;
        box-sizing: border-box;
      }

      &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: $insetMargin * 2;
      }

      .body {
        overflow: hidden;
        height: 100%;
        border: $insetMargin solid #d0d0d0;
        box-sizing: border-box;
        border-radius: 2px;

        .faded {
          position: absolute;
          top: 0;
          left: 0;
          bottom: $insetMargin * 2;
          background: rgba(white, 0.8);
          box-shadow: inset 0 0 5px #000;
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);

          &.left {
            border-right: 1px solid #ddd;
            border-right: 1px solid rgba(221, 221, 221, 0.4);
          }

          &.right {
            border-left: 1px solid #ddd;
            border-left: 1px solid rgba(221, 221, 221, 0.4);
          }
        }
      }
    }

    footer,
    header {
      position: absolute;
      font-size: 12px;
      text-align: left;
      padding: 0 $padding;
      left: -$padding - $insetMargin - $annotationBorderWidth;
      right: -$padding - $insetMargin - $annotationBorderWidth;
      background: $annotationBg;
      box-sizing: border-box;
    }

    header {
      bottom: 100%;
      margin-top: -$padding;
      margin-bottom: $padding;
      padding-top: $padding;

      // Borders
      border-top: $border;
      border-left: $border;
      border-right: $border;
      border-top-left-radius: $radius;
      border-top-right-radius: $radius;
    }

    footer {
      top: 100%;
      margin-top: $padding - $insetMargin;
      margin-bottom: -$padding;
      padding-bottom: $padding;

      // Borders
      border-left: $border;
      border-right: $border;
      border-bottom: $border;
      border-bottom-left-radius: $radius;
      border-bottom-right-radius: $radius;
      box-sizing: border-box;

      .buttonpadded {
        margin: 7px -4px;

        :global(button) {
          margin: 0 4px;
        }
      }
    }

    .closeflag {
      $flagHeight: 25px;
      $flagWidth: 29px;
      $closeHeight: 14px;

      position: absolute;
      top: 20px;
      left: -$flagWidth - $annotationBorderWidth;
      width: $flagWidth;
      height: $flagHeight;
      border-top-left-radius: ($flagHeight / 2);
      border-bottom-left-radius: ($flagHeight / 2);
      background: $annotationBorder;

      .closer {
        @include buttonLike;
        display: inline-block;

        :global(svg) {
          width: $closeHeight;
          height: $closeHeight;
          margin: ($flagHeight - $closeHeight) / 2;
        }
      }
    }

    input,
    textarea {
      border: 1px solid #d0d0d0;
      border-radius: 3px;
      font-size: 12px;
      width: 100%;
      padding: 2px 4px;
      box-sizing: border-box;
      outline: none;
    }

    textarea {
      height: 110px;
      min-height: 30px;
      resize: vertical;
    }
  }
</style>

<div
  class="annotation"
  on:mousedown|stopPropagation
  style="top: {annotation.y1 * 100}%; height: {annotation.height * 100}%">
  <header>
    <div class="closeflag">
      <span class="closer" on:click={cancelActions}>
        {@html closeInlineSvg}
      </span>
    </div>
    <input placeholder="Annotation Title" />
  </header>
  <div class="excerpt">
    <div class="body">
      <div style="margin-top: {-annotation.y1 * aspect * 100}%">
        <Image
          src={pageImageUrl(document, annotation.page)}
          fade={false}
          {aspect} />
        <!-- Faded flanks -->
        <div
          class="faded left"
          style="left: 0; width: {annotation.x1 * 100}%" />
        <div
          class="faded right"
          style="left: {annotation.x2 * 100}%; right: 0" />
      </div>
    </div>
  </div>
  <footer>
    <textarea />
    <div class="buttonpadded">
      <Button>Save</Button>
      <Button secondary={true}>Cancel</Button>
    </div>
  </footer>
</div>
