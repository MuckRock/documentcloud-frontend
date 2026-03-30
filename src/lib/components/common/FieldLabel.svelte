<!-- @component
  FieldLabel is a presentational component for giving title and details about a field.
  It has props for whether the field is required or exclusive to premium account holders.
-->

<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import type { SvgComponent } from "svelte-octicons";
  import { _ } from "svelte-i18n";
  import PremiumBadge from "$lib/components/premium-credits/PremiumBadge.svelte";
  import Flex from "./Flex.svelte";

  interface Props {
    required?: boolean;
    premium?: boolean;
    icon?: Component | typeof SvgComponent;
    children: Snippet;
    action?: Snippet;
  }

  let {
    required = false,
    premium = false,
    icon: Icon,
    children,
    action,
  }: Props = $props();
</script>

<div class="label">
  <Flex justify="between" align="center">
    <Flex align="baseline">
      {#if Icon}
        <div class="icon"><Icon /></div>
      {/if}
      {@render children()}
      {#if required}
        <span class="required">{$_("inputs.required")}</span>
      {/if}
    </Flex>
    <Flex align="baseline">
      {#if premium}<PremiumBadge />{/if}
      {@render action?.()}
    </Flex>
  </Flex>
</div>

<style>
  .label {
    color: var(--gray-5, #233944);
    font-weight: 600;
    font-size: var(--font-md);
    font-feature-settings: "ss04" on;
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
