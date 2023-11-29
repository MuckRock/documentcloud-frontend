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
    fill: var(--credit-color, --premium);
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
  {#if badge}
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM7.99999 3.33761L3.96224 5.6688V10.3312L7.99999 12.6624L12.0377 10.3312V5.6688L7.99999 3.33761ZM13 5.11325L7.99999 2.2265L2.99999 5.11325V10.8868L7.99999 13.7735L13 10.8868V5.11325ZM9.33333 8C9.33333 8.73638 8.73638 9.33333 8 9.33333C7.26362 9.33333 6.66667 8.73638 6.66667 8C6.66667 7.26362 7.26362 6.66667 8 6.66667C8.73638 6.66667 9.33333 7.26362 9.33333 8Z"
    />
  {:else}
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M3.96225 5.6688L8 3.33761L12.0377 5.6688V10.3312L8 12.6624L3.96225 10.3312V5.6688ZM8 2.2265L13 5.11325V10.8868L8 13.7735L3 10.8868V5.11325L8 2.2265ZM8.00001 9.33333C8.73639 9.33333 9.33334 8.73638 9.33334 8C9.33334 7.26362 8.73639 6.66667 8.00001 6.66667C7.26363 6.66667 6.66667 7.26362 6.66667 8C6.66667 8.73638 7.26363 9.33333 8.00001 9.33333Z"
    />
  {/if}
</svg>
