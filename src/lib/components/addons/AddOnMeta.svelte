<script lang="ts">
  import type { AddOn } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { MarkGithub16 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Metadata from "../common/Metadata.svelte";
  import { clean } from "$lib/utils/markup";

  interface Props {
    addon: AddOn;
  }

  let { addon }: Props = $props();

  let repo = $derived(new URL(addon.repository, "https://github.com/").href);
  let github_org = $derived(addon.repository.split("/")[0]);
  let instructions = $derived(
    addon.parameters.instructions ? clean(addon.parameters.instructions) : "",
  );
</script>

<div class="container">
  <h2 class="name">{addon.name}</h2>
  <div class="description">
    {@html addon.parameters?.description}
  </div>
  {#if instructions}
    <div class="instructions">
      <details>
        <summary>
          {$_("addonDispatchDialog.instructions")}
        </summary>
        {@html instructions}
      </details>
    </div>
  {/if}
  <Flex wrap align="center" justify="between">
    <Metadata key={$_("addonDispatchDialog.createdBy")}>
      <h3>{github_org}</h3>
    </Metadata>
    <Flex>
      <Button ghost mode="primary" href={repo} target="_blank">
        <MarkGithub16 />
        {$_("addonDispatchDialog.viewsource")}
      </Button>
    </Flex>
  </Flex>
</div>

<style>
  h2 {
    margin-bottom: 1rem;
    font-size: var(--font-xl);
  }

  h3 {
    font-size: var(--font-l);
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
</style>
