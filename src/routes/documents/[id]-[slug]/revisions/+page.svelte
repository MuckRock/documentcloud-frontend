<script lang="ts">
  import { _ } from "svelte-i18n";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import Revisions from "$lib/components/documents/Revisions.svelte";
  import PremiumBadge from "@/premium-credits/PremiumBadge.svelte";

  export let data;

  $: document = data.document;
</script>

<ContentLayout>
  <header slot="header">
    <h2>{$_("dialogRevisionsDialog.heading")}</h2>
    <PremiumBadge />
  </header>

  <Revisions {document} />
</ContentLayout>

<style>
  header {
    display: flex;
    gap: 1em;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
</style>
