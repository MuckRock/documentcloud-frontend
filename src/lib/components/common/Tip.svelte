<script lang="ts">
  import { LightBulb16 } from "svelte-octicons";
  import Flex from "./Flex.svelte";
</script>

<aside class="tip">
  <div class="icon"><slot name="icon"><LightBulb16 /></slot></div>
  <Flex direction="column" justify="center">
    <slot />
  </Flex>
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
    box-shadow: var(--shadow);
  }
  .icon {
    display: flex;
    align-items: center;
  }
</style>
