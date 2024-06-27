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
  import PageToolbar from "@/lib/components/common/PageToolbar.svelte";
  import Card from "@/lib/components/common/Card.svelte";

  export let data;

  $: document = data.document;
  $: user = data.me;
  $: organization =
    typeof user?.organization === "object" ? (user.organization as Org) : null;
  $: plan = organization?.plan ?? "Free";
</script>

<ContentLayout>
  <PageToolbar slot="header">
    <Flex align="baseline" slot="left">
      <h2>{$_("dialogRevisionsDialog.heading")}</h2>
      <PremiumBadge />
    </Flex>
    {#if plan !== "Free"}
    <RevisionControl {document} slot="right" />
    {/if}
  </PageToolbar>
  {#if plan !== "Free"}
  <Card>
    <Revisions {document} />
  </Card>
  {:else}
  <UpgradePrompt
    message={$_("dialogRevisionsDialog.upgrade.message")}
    callToAction={$_("dialogRevisionsDialog.upgrade.adminCta")}
    href={getUpgradeUrl(organization).href}
  />
  {/if}
</ContentLayout>
