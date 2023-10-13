<script lang="ts">
  const REM = 16;
  export let size = 1;
  export let title = "Language";
</script>

<style>
  svg {
    display: block;
    stroke: var(--darkgray);
    fill: none;
  }
</style>

<svg width={`${size * REM}px`} height={`${size * REM}px`} viewBox="0 0 16 16">
  <title>{title}</title>
  <path
    d="M12.3334 5H6.33335M9.33335 4V5M7.66669 12L5.66669 7.33333L3.66669 12M7.0521 10.6667H4.28127M7.47294 5C7.47294 5 7.97919 6.95833 9.18752 8.4375C10.3959 9.91667 11.6667 10.6667 11.6667 10.6667M8.00002 9.66667C8.00002 9.66667 8.72919 9.10417 9.50002 8.10417C10.2709 7.10417 10.6667 6.33333 10.6667 6.33333"
    stroke="black"
    stroke-width="0.666667"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
