<script>
  import { tweened } from "svelte/motion";
  import { sigmoid, interp, scale } from "@/util/easing.js";

  export let progress;
  export let initializing = false;
  export let compact = false;
  export let failure = false;

  const PROGRESS_DURATION = parseInt(import.meta.env.DC_POLL_INTERVAL);
  const PROGRESS_END_DURATION = 400; // how quickly to jump at end
  const PROGRESS_BACKWARDS_DURATION = 400; // how quickly to jump backwards

  let lastProgress = null;
  let realProgress = null;
  $: {
    if (progress == null) {
      realProgress = lastProgress;
    } else {
      lastProgress = progress;
      realProgress = progress;
    }
  }

  const smoothProgress = tweened(realProgress, {
    duration: PROGRESS_DURATION,
    interpolate(a, b) {
      // Jump immediately to 0
      if (b == 0) return (t) => 0;

      // If going backwards, don't tween
      if (b < a) {
        return interp(
          scale(sigmoid, PROGRESS_BACKWARDS_DURATION / PROGRESS_DURATION),
          a,
          b,
        );
      }

      // If reaching end of progress, tween with a faster rate
      if (b == 1) {
        return interp(
          scale(sigmoid, PROGRESS_END_DURATION / PROGRESS_DURATION),
          a,
          b,
        );
      }

      // Use standard sigmoid otherwise
      return (t) => sigmoid(t) * (b - a) + a;
    },
  });

  $: isNull = realProgress == null;
  $: $smoothProgress = realProgress;
  $: complete = $smoothProgress == 1;

  $: progressPercent = `${Math.max(
    Math.min(Math.floor($smoothProgress * 100), 100),
    0,
  )}%`;
</script>

<style lang="scss">
  .container {
    width: 100%;
    max-width: 400px;
    display: inline-block;
    vertical-align: middle;

    .bar {
      height: 18px;
      border-radius: $radius;
      display: table-cell;
      vertical-align: middle;
      width: 100%;
      max-width: 300px;
      background: $barFaded;
      position: relative;
      margin-top: 1em;
      margin-right: 18px;

      &.compact {
        height: 12px;
        display: inline-block;
        margin-top: 0;
        margin-right: 0;
      }

      &.initializing {
        background: repeating-linear-gradient(
          57deg,
          darken($barFaded, 10%),
          darken($barFaded, 10%) 20px,
          $barFaded 20px,
          $barFaded 40px /* determines size */
        );
        background-size: 48px 48px;
        animation: slide 1s infinite linear forwards;
      }

      .inner {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        background: $primary;
        background: repeating-linear-gradient(
          57deg,
          rgba($primary, 0.8),
          rgba($primary, 0.8) 20px,
          $primary 20px,
          $primary 40px /* determines size */
        );
        background-size: 48px 48px;
        animation: slide 1s infinite linear forwards;
        border-radius: $radius;

        &.complete {
          animation: none;
          background: $primary;
        }
      }
      &.failure .inner {
        background: $caution;
      }
    }
    .text {
      @include processingText;

      display: table-cell;
      vertical-align: middle;
      padding-left: 20px;
      &.failure {
        color: $caution;
      }
    }
  }

  @keyframes slide {
    0% {
      background-position: 48px 0;
    }
    100% {
      background-position: 0 0;
    }
  }
</style>

<div class="container">
  {#if !isNull}
    <div class="bar" class:initializing class:compact class:failure>
      <div
        class="inner"
        class:complete
        style="width: {$smoothProgress * 100}%"
      />
    </div>
    {#if !compact}
      <div class="text" class:failure>{progressPercent}</div>
    {/if}
  {/if}
</div>
