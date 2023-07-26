<script lang="ts">
  import Button from "../../common/Button.svelte";
  import BackArrow from "../../common/icons/BackArrow.svelte";
  import ShareIcon from 'svelte-octicons/lib/Share16.svelte';
  import GitHubIcon from "svelte-octicons/lib/MarkGithub16.svelte";
  import type { AddOnListItem } from "../browser/AddOnListItem.svelte";
  import { _ } from "svelte-i18n";
  import Hashtag from "../../common/icons/Hashtag.svelte";

  export let addon: AddOnListItem;

  $: author = addon.author || addon.repository.split("/")[0];

  async function onShare() {
    // TODO Provide user feedback upon sharing success or error.
    // Right now using alert() which is okay but not ideal.
    try {
      if (navigator.share) {
        await navigator.share({ url: window.location.href, title: document.title });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        alert($_("addonDispatchDialog.shareClipboardSuccess"));
      }
    } catch (error) {
      alert(error.message);
    }
  }
</script>

<style>
  header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1em;
  }
  .description {
    flex: 1 1 100%;
    line-height: 1.4;
    color: var(--darkgray);
  }
  .description :global(a) {
    color: var(--primary);
    text-decoration: underline;
  }
  .description :global(*):first-child {
    margin-top: 0;
  }
  .name {
    flex: 1 1 100%;
    margin: 0;
  }
  .metadata {
    display: flex;
    gap: 1em;
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
    margin-left: .5em;
    display: inline-block;
    font-weight: 600;
  }
  .actions {
    display: flex;
    flex-direction: row;
    gap: 1em;
  }
  .author dd {
    padding: .1em 0;
  }
  .category {
    display: inline-flex;
    align-items: center;
    gap: .125em;
    color: var(--darkgray);
    fill: var(--gray);
    font-weight: 600;
    padding: .1em .2em;
    border-radius: var(--radius);
    transform: translateX(-.2em);
  }
  .category:hover {
    background: rgba(0, 0, 0, .1);
  }
</style>

<header>
  <Button action href="#add-ons">
    <BackArrow size={.8} /> {$_("addonDispatchDialog.backButton")}
  </Button>

  <h2 class="name">{addon.name}</h2>

  <dl class="metadata">
    <div class="author">
      <dt>{$_("addonDispatchDialog.createdBy")}</dt>
      <dd>{author}</dd>
    </div>

    <div class="categories">
      {#if addon.categories}
        <dt>{$_("addonDispatchDialog.categories")}</dt>
        {#each addon.categories as category}
        <dd>
          <a class="category" href={`#add-ons?categories=${category}`}>
            <Hashtag size={0.8} />
            <slot>{category}</slot>
          </a>
        </dd>
        {/each}
      {/if}
    </div>
  </dl>

  <div class="actions">
    <Button action on:click={onShare}><ShareIcon fill="#4294f0" /> {$_("addonDispatchDialog.share")}</Button>
    <Button action href="https://github.com/{addon.repository}"><GitHubIcon fill="#4294f0" /> {$_("addonDispatchDialog.viewsource")}</Button>
  </div>

  <div class="description">
    {@html addon.parameters.description}
  </div>
</header>
