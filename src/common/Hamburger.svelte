<script lang="ts">
  import { ThreeBars16 } from "svelte-octicons";

  let className: string = "";
  export { className as class };
</script>

<div class="hamburger">
  <button class={`svg buttonLike ${className}`} on:click>
    <slot name="icon"><ThreeBars16 /></slot>
  </button>
</div>

<style>
  .hamburger .svg {
    cursor: pointer;
  }

  .hamburger .svg:hover {
    opacity: var(--hover-opacity, 0.8);
  }

  @media only screen and (max-width: 720px) {
    .hamburger {
      display: block;
    }
  }
</style>
