<script lang="ts">
  const REM = 16;
  export let size = 1;
  export let title = "Credit";
  export let badge = false;
  export let color = "#24CC99";
</script>

<style>
  svg {
    display: block;
  }
  .icon path {
    fill: var(--credit-color, --premium);
  }
  .badge {
    background: var(--credit-color, --premium);
    border-radius: 50%;
  }
  .badge path {
    fill: var(--white);
  }
</style>

<svg
  width={`${size * REM}px`}
  height={`${size * REM}px`}
  viewBox="0 0 16 16"
  class={badge ? "badge" : "icon"}
  style="--credit-color: {color}"
>
  <title>{title}</title>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M3.96225 5.6688L8 3.33761L12.0377 5.6688V10.3312L8 12.6624L3.96225 10.3312V5.6688ZM8 2.2265L13 5.11325V10.8868L8 13.7735L3 10.8868V5.11325L8 2.2265ZM8.00001 9.33333C8.73639 9.33333 9.33334 8.73638 9.33334 8C9.33334 7.26362 8.73639 6.66667 8.00001 6.66667C7.26363 6.66667 6.66667 7.26362 6.66667 8C6.66667 8.73638 7.26363 9.33333 8.00001 9.33333Z"
  />
</svg>
