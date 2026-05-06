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

  let directionClass = $derived(reverse ? `${direction}-reverse` : direction);
</script>

<div
  {...rest}
  class="{directionClass} align-{align} justify-{justify} {wrap
    ? 'wrap'
    : 'nowrap'} {rest.class ?? ''}"
  style:--gap="{gap}rem"
  {role}
>
  {@render children()}
</div>

<style>
  div {
    display: flex;
    gap: var(--gap);
  }

  /* direction */
  div.row {
    flex-direction: row;
  }
  div.row-reverse {
    flex-direction: row-reverse;
  }
  div.column {
    flex-direction: column;
  }
  div.column-reverse {
    flex-direction: column-reverse;
  }

  /* align-items */
  div.align-start {
    align-items: flex-start;
  }
  div.align-center {
    align-items: center;
  }
  div.align-end {
    align-items: flex-end;
  }
  div.align-stretch {
    align-items: stretch;
  }
  div.align-baseline {
    align-items: baseline;
  }

  /* justify-content */
  div.justify-start {
    justify-content: flex-start;
  }
  div.justify-center {
    justify-content: center;
  }
  div.justify-end {
    justify-content: flex-end;
  }
  div.justify-around {
    justify-content: space-around;
  }
  div.justify-between {
    justify-content: space-between;
  }
  div.justify-evenly {
    justify-content: space-evenly;
  }

  /* wrap */
  div.wrap {
    flex-wrap: wrap;
  }
  div.nowrap {
    flex-wrap: nowrap;
  }
</style>
