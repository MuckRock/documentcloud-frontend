<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AddOnMeta from "../AddOnMeta.svelte";
  import { addon } from "@/test/fixtures/addons";

  const { Story } = defineMeta({
    title: "Add-Ons / Metadata",
    component: AddOnMeta,
  });
</script>

<Story name="Metadata" asChild>
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
