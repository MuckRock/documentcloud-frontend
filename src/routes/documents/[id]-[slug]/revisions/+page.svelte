<script lang="ts">
  import { _ } from "svelte-i18n";
  import type { Org } from "@/api/types/orgAndUser";
  import { getUpgradeUrl } from "$lib/api/accounts";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import Revisions from "$lib/components/documents/Revisions.svelte";
  import RevisionControl from "$lib/components/forms/RevisionControl.svelte";
  import PremiumBadge from "@/premium-credits/PremiumBadge.svelte";
  import Flex from "@/lib/components/common/Flex.svelte";
  import UpgradePrompt from "@/premium-credits/UpgradePrompt.svelte";

  export let data;

  $: document = data.document;
  $: user = data.me;
  $: organization =
    typeof user?.organization === "object" ? (user.organization as Org) : null;
  $: plan = organization?.plan ?? "Free";
</script>

<ContentLayout>
  <header slot="header">
    <Flex align="baseline">
      <h2>{$_("dialogRevisionsDialog.heading")}</h2>
      <PremiumBadge />
    </Flex>
  </header>
  {#if plan !== "Free"}
  <Revisions {document} />

  <RevisionControl {document} />
  {:else}
  <UpgradePrompt
    message={$_("dialogRevisionsDialog.upgrade.message")}
    callToAction={$_("dialogRevisionsDialog.upgrade.adminCta")}
    href={getUpgradeUrl(organization).href}
  />
  {/if}
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
