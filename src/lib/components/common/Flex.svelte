<script lang="ts">
  /* Based on https://github.com/himynameisdave/svelte-flex */

  type Align = "center" | "end" | "start" | "stretch";
  type Justify = "around" | "between" | "center" | "end" | "evenly" | "start";
  type Direction = "column" | "row";

  export let direction: Direction = "row";
  export let align: Align = "stretch";
  export let justify: Justify = "start";
  export let reverse = false;
  export let gap: number = 0.5;

  const alignMap: Record<Align, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
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
  style:align-items={alignMap[align]}
  style:justify-content={justifyMap[justify]}
  style:gap={`${gap}rem`}
  class={$$restProps.class}
>
  <slot />
</div>
