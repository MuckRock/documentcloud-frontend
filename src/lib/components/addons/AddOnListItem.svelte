<script lang="ts">
  import type { AddOnListItem } from "@/addons/types";

  import { _ } from "svelte-i18n";

  import AddOnPin from "@/addons/AddOnPin.svelte";
  import PremiumBadge from "@/premium-credits/PremiumBadge.svelte";

  export let addon: AddOnListItem;

  $: url = `/add-ons/${addon?.repository}/`;
  $: description = addon?.parameters?.description;
  $: author = { name: addon?.repository?.split("/")[0] };
  $: isPremium = addon?.parameters?.categories?.includes("premium") ?? false;
</script>

<a class="addon-link" href={url}>
  <div class="container" id={addon.repository}>
    <div class="row">
      <div class="center-self">
        <AddOnPin {addon} />
      </div>
      <div class="stretch">
        <h3 class="addon-name">{addon.name}</h3>
      </div>
      <div class="metadata">
        {#if author?.name}
          <p class="author">
            <a
              href="http://github.com/{addon.repository}"
              target="_blank"
              rel="noopener noreferrer"
              title={$_("addonBrowserDialog.viewsource")}>{author.name}</a
            >
          </p>
        {/if}
        {#if isPremium}
          <span class="badge" role="status"><PremiumBadge /></span>
        {/if}
      </div>
    </div>
    {#if description}
      <div class="description">{@html description}</div>
    {/if}
  </div>
</a>

<style>
  a {
    color: inherit;
    text-decoration: none;
  }

  .container {
    display: block;
    min-width: 12rem;
    padding: 0.5rem 0.5rem 0.75rem;
    text-align: left;
  }

  .addon-link:hover .container {
    background-color: var(--blue-1);
  }

  .row {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    margin: 0.5rem;
  }

  .badge {
    margin-bottom: -0.25em;
    font-size: 0.8em;
  }

  .metadata {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    color: var(--gray-4);
  }

  .description {
    margin: 0 0.5em;
    opacity: 0.6;
    font-size: 0.875em;
    line-height: 1.4;
    color: var(--gray-4);
    overflow: hidden;
    -webkit-line-clamp: 4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    & > * {
      margin-top: 0;
      font-size: 0.875rem;
    }
  }

  .addon-name {
    margin: 0;
    font-weight: 600;
    font-size: var(--font-lg);
  }

  .center-self {
    align-self: center;
  }

  .stretch {
    flex: 1 1 auto;
  }

  .author a:hover {
    opacity: 0.7;
  }

  p {
    margin: 0;
  }
</style>
