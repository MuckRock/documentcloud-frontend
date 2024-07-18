<!-- @component
  FieldLabel is a presentational component for giving title and details about a field.
  It has props for whether the field is required or exclusive to premium account holders.
-->

<script lang="ts">
  import { _ } from "svelte-i18n";
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
        <span class="required">{$_("inputs.required")}</span>
      {/if}
    </Flex>
    <Flex align="baseline">
      {#if premium}<PremiumBadge />{/if}
      <slot name="action" />
    </Flex>
  </Flex>
</div>

<style>
  .label {
    color: var(--gray-5, #233944);
    font-weight: 600;
    font-size: var(--font-md);
    font-feature-settings: 'ss04' on;
  }
  .required {
    font-size: var(--font-xs);
    color: var(--orange-3, #ec7b6b);
  }
  .icon {
    display: inline-flex;
    align-self: center;
    height: 100%;
  }
</style>
