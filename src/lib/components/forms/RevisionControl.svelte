<!-- @component
Enable or disable revisions for a document,
or get an upgrade prompt.
-->
<script lang="ts">
  import type { Document } from "$lib/api/types";
  import type { User, Org } from "@/api/types/orgAndUser";

  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Field from "../inputs/Field.svelte";
  import Switch from "../inputs/Switch.svelte";
  import UpgradePrompt from "@/premium-credits/UpgradePrompt.svelte";

  import { getUpgradeUrl } from "$lib/api/accounts";
  import { canonicalUrl } from "$lib/api/documents";

  export let document: Document;
  export let user: User = null; // using a prop for testability

  $: action = canonicalUrl(document).href + "?/revisions";
  $: organization =
    typeof user?.organization === "object" ? (user.organization as Org) : null;
  $: plan = organization?.plan ?? "Free";
</script>

{#if plan !== "Free"}
  <form {action} method="post">
    <Flex direction="column" gap={1} align="center">
      <Field title={$_("dialogRevisionsDialog.controlLabel")}>
        <Switch name="revision_control" checked={document.revision_control} />
      </Field>
      <Flex class="buttons">
        <Button type="submit" mode="primary">{$_("dialog.save")}</Button>
        <Button type="reset">
          {$_("dialog.cancel")}
        </Button>
      </Flex>
    </Flex>
  </form>
{:else}
  <UpgradePrompt
    message={$_("dialogRevisionsDialog.upgrade.message")}
    callToAction={$_("dialogRevisionsDialog.upgrade.adminCta")}
    href={getUpgradeUrl(organization).href}
  />
{/if}
