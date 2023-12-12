<script>
  import { createEventDispatcher } from "svelte";
  import { ThreeBars16 } from "svelte-octicons";

  const dispatch = createEventDispatcher();
</script>

<div class="hamburger">
  <button class="svg buttonLike" on:click={(e) => dispatch("toggle")}>
    <ThreeBars16 />
  </button>
</div>

<style>
  .hamburger {
    user-select: none;
    position: fixed;
    top: 0;
    padding: 14px;
    z-index: var(--hamburgerZ, 8);
    display: none;
  }
  .hamburger .svg {
    cursor: pointer;
    fill: var(--gray, rgba(0, 0, 0, 0.53));
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
