<script lang="ts">
  import type { AriaRole } from "svelte/elements";

  /* Based on https://github.com/himynameisdave/svelte-flex */

  type Align = "center" | "end" | "start" | "stretch" | "baseline";
  type Justify = "around" | "between" | "center" | "end" | "evenly" | "start";
  type Direction = "column" | "row";

  export let direction: Direction = "row";
  export let align: Align = "stretch";
  export let justify: Justify = "start";
  export let reverse = false;
  export let gap: number = 0.5;
  export let wrap: boolean = false;
  export let role: null | AriaRole = null;

  const alignMap: Record<Align, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
    baseline: "baseline",
  };

  const justifyMap: Record<Justify, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    around: "space-around",
    between: "space-between",
    evenly: "space-evenly",
  };

  $: directionWithReverse = reverse ? `${direction}-reverse` : direction;
</script>

<div
  {...$$restProps}
  style:display="flex"
  style:flex-direction={directionWithReverse}
  style:flex-wrap={wrap ? "wrap" : "nowrap"}
  style:align-items={alignMap[align]}
  style:justify-content={justifyMap[justify]}
  style:gap={`${gap}rem`}
  class={$$restProps.class}
  {role}
>
  <slot />
</div>
