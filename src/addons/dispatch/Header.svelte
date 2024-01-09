<script lang="ts">
  import { _ } from "svelte-i18n";

  import type { AddOnListItem } from "../types.ts";
  import BackArrow from "../../common/icons/BackArrow.svelte";
  import Button from "../../common/Button.svelte";
  import GitHubIcon from "svelte-octicons/lib/MarkGithub16.svelte";
  import ShareIcon from "svelte-octicons/lib/Share16.svelte";

  import { pushToast } from "../../common/Toast.svelte";
  import AddOnPin from "../AddOnPin.svelte";
  import Badge from "../../common/Badge.svelte";
  import Credit from "../../common/icons/Credit.svelte";

  export let addon: AddOnListItem;

  $: author = addon.repository.split("/")[0];
  $: isPremium = addon?.parameters.categories?.includes("premium") ?? false;

  async function onShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          url: window.location.href,
          title: document.title,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        pushToast($_("addonDispatchDialog.shareClipboardSuccess"), "success");
      }
    } catch (error) {
      pushToast(error.message, "error");
    }
  }
</script>

<header>
  <div class="actions jB">
    <Button action href="#add-ons">
      <BackArrow size={0.8} />
      {$_("addonDispatchDialog.backButton")}
    </Button>
    <div class="actions padRight">
      <Button action on:click={onShare}
        ><ShareIcon fill="#4294f0" /> {$_("addonDispatchDialog.share")}</Button
      >
      <Button action href="https://github.com/{addon.repository}"
        ><GitHubIcon fill="#4294f0" />
        {$_("addonDispatchDialog.viewsource")}</Button
      >
    </div>
  </div>

  <div class="name">
    <span class="pin"><AddOnPin {addon} size={1.25} /></span>
    <h2>{addon.name}</h2>
  </div>

  <dl class="metadata">
    <div class="author">
      <dt>{$_("addonDispatchDialog.createdBy")}</dt>
      <dd>{author}</dd>
    </div>

    <div class="categories">
      {#if addon?.parameters?.categories}
        <dt>{$_("addonDispatchDialog.categories")}</dt>
        {#each addon.parameters.categories as category}
          {#if category !== "premium"}
            <dd>
              <a class="category" href={`#add-ons?categories=${category}`}>
                <slot>{category}</slot>
              </a>
            </dd>
          {/if}
        {/each}
      {/if}
    </div>
    {#if isPremium}
      <a href="#add-ons?premium=true" class="premium"
        ><Badge
          label="Premium"
          badgeColor="var(--premium)"
          labelColor="var(--darkgray)"
          ><Credit slot="icon" color="var(--darkgray)" badge /></Badge
        ></a
      >
    {/if}
  </dl>

  <div class="description">
    {@html addon?.parameters?.description}
  </div>

  {#if addon.parameters.instructions}
    <div class="instructions">
      {@html addon.parameters.instructions}
    </div>
  {/if}
</header>

<style>
  header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1em;
  }
  .description,
  .instructions {
    flex: 1 1 100%;
    line-height: 1.4;
    color: var(--darkgray);
  }
  .description :global(a),
  .instructions :global(a) {
    color: var(--primary);
    text-decoration: underline;
  }
  .description :global(*):first-child,
  .description :global(*):first-child {
    margin-top: 0;
  }
  .name {
    flex: 1 1 100%;
    display: flex;
    align-items: baseline;
    gap: 1em;
  }
  .pin {
    flex: 0 1 auto;
    transform: translateY(0.15rem);
  }
  .name h2 {
    margin: 0;
    flex: 1 1 auto;
  }
  .metadata {
    flex: 1 1 auto;
    display: flex;
    gap: 1em;
    align-items: flex-end;
    margin: 0;
  }
  .metadata dt {
    font-variant: small-caps;
    text-transform: lowercase;
  }
  .metadata dd:first-of-type {
    margin-left: 0;
  }
  .metadata dd:last-child {
    margin-right: 1em;
  }
  .metadata dd {
    margin-left: 0.5em;
    display: inline-block;
    font-weight: 600;
  }
  .categories {
    flex: 1 1 auto;
  }
  .premium {
    flex: 0 1 auto;
    justify-self: flex-end;
  }
  .actions {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0 1em;
  }
  .actions.jB {
    flex: 1 1 auto;
    justify-content: space-between;
  }
  .actions.padRight {
    margin-right: 3rem;
  }
  .author dd {
    padding: 0.1em 0;
  }
  .category {
    display: inline-flex;
    align-items: center;
    gap: 0.125em;
    color: var(--darkgray);
    fill: var(--gray);
    font-weight: 600;
    padding: 0.1em 0.2em;
    border-radius: var(--radius);
    transform: translateX(-0.2em);
    text-transform: capitalize;
  }
  .category:hover {
    background: rgba(0, 0, 0, 0.1);
  }
</style>
