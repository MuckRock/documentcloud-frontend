<script lang="ts">
  import PremiumBadge from "@/premium-credits/PremiumBadge.svelte";
  import Flex from "./Flex.svelte";

  export let required = false;
  export let premium = false;
</script>

<div class="label">
  <Flex justify="between" align="center">
    <Flex align="baseline">
      {#if $$slots.icon}
        <div class="icon"><slot name="icon" /></div>
      {/if}
      <slot />
      {#if required}
        <span class="required">Required</span>
      {/if}
    </Flex>
    {#if premium}<PremiumBadge />{/if}
  </Flex>
</div>

<style>
  .label {
    color: var(--gray-5, #233944);
    font-weight: 600;
    font-size: var(--font-s);
  }
  .required {
    font-size: var(--font-xs);
    color: var(--orange, #ec7b6b);
  }
  .icon {
    display: inline-flex;
    align-self: center;
    height: 100%;
  }
</style>
