<script lang="ts">
  import type { AddOnListItem } from "@/addons/types";

  import { _ } from "svelte-i18n";
  import { MarkGithub16, Share16 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Flex from "@/lib/components/common/Flex.svelte";

  export let addon: AddOnListItem;

  $: repo = new URL(addon.repository, "https://github.com/").href;
  $: github_org = addon.repository.split("/")[0];
</script>

<Flex class="description" direction="column">
  {@html addon.parameters.description}
</Flex>
{#if addon.parameters.instructions}
  <Flex class="instructions" direction="column">
    {@html addon.parameters.instructions}
  </Flex>
{/if}

<Flex class="actions" direction="column" align="start">
  <div class="created-by">
    <span>{$_("addonDispatchDialog.createdBy")}</span>
    <h3>{github_org}</h3>
  </div>
  <Button mode="ghost">
    <Share16 />
    {$_("addonDispatchDialog.share")}
  </Button>
  <Button mode="ghost" href={repo} target="_blank">
    <MarkGithub16 />
    {$_("addonDispatchDialog.viewsource")}
  </Button>
</Flex>

<style>
  .created-by {
    display: flex;
    padding: 0rem 0.375rem;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;
  }

  .created-by span {
    color: var(--gray-4, #5c717c);
    font-size: var(--font-xs);
    letter-spacing: 0.07031rem;
    text-transform: uppercase;
  }
</style>
