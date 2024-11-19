<script lang="ts">
  import { LightBulb24 } from "svelte-octicons";

  export let mode: "normal" | "primary" | "premium" | "danger" = "normal";
</script>

<aside class="tip {mode}">
  <div class="icon"><slot name="icon"><LightBulb24 /></slot></div>
  <div class="inner">
    <slot />
  </div>
</aside>

<style>
  .tip {
    display: flex;
    gap: var(--gap, 1rem);
    padding: var(--padding, 1rem);
    border-radius: var(--border-radius, 1rem);
    color: var(--color, var(--gray-5, #233944));
    fill: var(--fill, var(--gray-4, #5c717c));
    background-color: var(--background-color, var(--gray-1, #f5f6f7));
    border: 1px solid var(--border-color, var(--gray-3, #99a8b3));

    font-weight: var(--font-semibold);
  }
  .icon {
    display: flex;
    align-items: center;
  }
  .inner {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--font-md);
  }
  .tip.normal {
    color: var(--yellow-5);
    fill: var(--yellow-4);
    background-color: var(--yellow-3);
    border-color: var(--yellow-2);
    background: var(--yellow-1);
  }
  .tip.primary {
    color: var(--blue-5);
    fill: var(--blue-3);
    background-color: var(--blue-3);
    border-color: var(--blue-2);
    background: var(--blue-1);
  }
  .tip.premium {
    color: var(--green-5);
    fill: var(--green-3);
    background-color: var(--green-3);
    border-color: var(--green-2);
    background: var(--green-1);
  }
  .tip.danger {
    color: var(--orange-5);
    fill: var(--orange-3);
    background-color: var(--orange-3);
    border-color: var(--orange-2);
    background: var(--orange-1);
  }
</style>
