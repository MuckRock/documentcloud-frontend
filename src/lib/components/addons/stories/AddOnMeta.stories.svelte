<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import AddOnMeta from "../AddOnMeta.svelte";

  export const meta = {
    title: "Components / Add-Ons / Metadata",
    component: AddOnMeta,
  };

  import { addon } from "@/test/fixtures/addons";
</script>

<Story name="Metadata">
  <nav>
    <AddOnMeta {addon} />
  </nav>
</Story>

<style>
  nav {
    flex: 1 0 0;
    min-width: 16rem;
    max-width: 48rem;
    max-height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 1rem;
    gap: 1rem;
  }
</style>
