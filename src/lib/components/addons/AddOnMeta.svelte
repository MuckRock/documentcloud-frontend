<script lang="ts">
  import type { AddOnListItem } from "@/addons/types";

  import DOMPurify from "isomorphic-dompurify";
  import { _ } from "svelte-i18n";
  import { MarkGithub16 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Flex from "@/lib/components/common/Flex.svelte";
  import Metadata from "../common/Metadata.svelte";

  import { ALLOWED_TAGS, ALLOWED_ATTR } from "@/config/config.js";

  export let addon: AddOnListItem;

  $: repo = new URL(addon.repository, "https://github.com/").href;
  $: github_org = addon.repository.split("/")[0];
  $: description = addon.parameters.description
    ? clean(addon.parameters.description)
    : "";
  $: instructions = addon.parameters.instructions
    ? clean(addon.parameters.instructions)
    : "";

  function clean(html: string): string {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
  }
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
