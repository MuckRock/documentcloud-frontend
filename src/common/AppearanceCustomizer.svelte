<script>
  import AppearanceToggle from "./AppearanceToggle";

  export let options;
</script>

<style lang="scss">
  summary {
    @include buttonLike;

    outline: none;
    color: $primary;
    font-size: 14px;
    font-family: inherit;
  }
</style>

<details>
  <summary>Customize Appearance</summary>
  {#each options as option}
    {#if option.type == 'toggle'}
      <AppearanceToggle on:change {option} />
    {/if}
  {/each}
</details>
