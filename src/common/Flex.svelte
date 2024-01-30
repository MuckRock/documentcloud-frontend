<script lang="ts">
  export let as: keyof HTMLElementTagNameMap = "div";
  export let display: "flex" | "inline-flex" = "flex";
  export let direction: "row" | "row-reverse" | "column" | "column-reverse" =
    "row";
  export let wrap: boolean = false;
  /** Gap (REMs) */
  export let gap: number = 0;
  /** Align Items*/
  export let align:
    | "stretch"
    | "flex-start"
    | "flex-end"
    | "center"
    | "baseline" = "stretch";
  /** Justify Content */
  export let justify:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around" = "flex-start";
</script>

<svelte:element
  this={as}
  class={$$restProps.class}
  style={`display: ${display}; flex-direction: ${direction}; flex-wrap: ${
    wrap ? "wrap" : "nowrap"
  }; gap: ${gap}rem; align-items: ${align}; justify-content: ${justify}`}
>
  <slot />
</svelte:element>

<style>
  div > * {
    flex: 0 1 auto;
  }
</style>
