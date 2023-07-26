<script lang="ts">
  const REM = 16;
  export let size = 1;
  export let title = "Back Arrow";
</script>

<svg viewBox="0 0 16 15" width={`${size * REM}px`} height={`${size * REM}px`}>
  <title>{title}</title>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M.3 7.5l1.2 1.2L7.7 15 9 13.7 2.8 7.5 9 1.3 7.7 0 .3 7.5z"
  />
</svg>
