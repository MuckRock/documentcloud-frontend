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

<div class="conatiner">
  <h2 class="name">{addon.name}</h2>
  <div class="description">
    {@html addon.parameters.description}
  </div>
  {#if addon.parameters.instructions}
    <div class="instructions">
      {@html addon.parameters.instructions}
    </div>
  {/if}

  <Flex align="baseline" justify="between">
    <div class="created-by">
      <span>{$_("addonDispatchDialog.createdBy")}</span>
      <h3>{github_org}</h3>
    </div>
    <Flex>
      <Button mode="ghost">
        <Share16 />
        {$_("addonDispatchDialog.share")}
      </Button>
      <Button mode="ghost" href={repo} target="_blank">
        <MarkGithub16 />
        {$_("addonDispatchDialog.viewsource")}
      </Button>
    </Flex>
  </Flex>
</div>

<style>
  h2 {
    margin-bottom: 1rem;
  }

  h2,
  h3 {
    font-weight: var(--font-semibold);
  }

  .description,
  .instructions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .created-by {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .created-by span {
    color: var(--gray-4, #5c717c);
    font-size: var(--font-xs);
    letter-spacing: 0.07031rem;
    text-transform: uppercase;
  }
</style>
