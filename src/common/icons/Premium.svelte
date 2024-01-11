<script lang="ts">
  const REM = 16;
  export let size = 1;
  export let title = "Premium";
  export let color = "#24CC99";
</script>

<svg
  width={`${size * REM}px`}
  height={`${size * REM}px`}
  viewBox="0 0 16 16"
  style="--premium-color: {color}"
>
  <title>{title}</title>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M7 1C7 3.76142 4.76142 6 2 6C4.76142 6 7 8.23858 7 11C7 8.23858 9.23858 6 12 6C9.23858 6 7 3.76142 7 1Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M11 9C11 10.6569 9.65685 12 8 12C9.65685 12 11 13.3431 11 15C11 13.3431 12.3431 12 14 12C12.3431 12 11 10.6569 11 9Z"
  />
</svg>

<style>
  svg {
    display: block;
  }
</style>
