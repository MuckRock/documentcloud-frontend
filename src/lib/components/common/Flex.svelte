<script lang="ts">
  import type { Snippet } from "svelte";
  import type { AriaRole } from "svelte/elements";

  /* Based on https://github.com/himynameisdave/svelte-flex */

  type Align = "center" | "end" | "start" | "stretch" | "baseline";
  type Justify = "around" | "between" | "center" | "end" | "evenly" | "start";
  type Direction = "column" | "row";

  interface Props {
    direction?: Direction;
    align?: Align;
    justify?: Justify;
    reverse?: boolean;
    gap?: number;
    wrap?: boolean;
    role?: null | AriaRole;
    children: Snippet;
    [key: string]: any;
  }

  let {
    direction = "row",
    align = "stretch",
    justify = "start",
    reverse = false,
    gap = 0.5,
    wrap = false,
    role = null,
    children,
    ...rest
  }: Props = $props();

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

  let directionWithReverse = $derived(
    reverse ? `${direction}-reverse` : direction,
  );
</script>

<div
  {...rest}
  style:display="flex"
  style:flex-direction={directionWithReverse}
  style:flex-wrap={wrap ? "wrap" : "nowrap"}
  style:align-items={alignMap[align]}
  style:justify-content={justifyMap[justify]}
  style:gap={`${gap}rem`}
  class={rest.class}
  {role}
>
  {@render children()}
</div>
