<script lang="ts">
  import { _ } from "svelte-i18n";

  import AddOnPin from "../AddOnPin.svelte";
  import AddOnPopularity from "../Popularity.svelte";
  import type { AddOnListItem } from "../types.js";
  import Credit from "../../common/icons/Credit.svelte";
  import Badge from "../../common/Badge.svelte";

  export let addon: AddOnListItem;

  $: description = addon?.parameters?.description;
  $: author = { name: addon?.repository?.split("/")[0] };
  $: url = `#add-ons/${addon?.repository}`;
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
        {#if addon.usage}
          <AddOnPopularity useCount={addon.usage} />
        {/if}
        {#if isPremium}
          <span class="badge"
            ><Badge
              label="Premium"
              badgeColor="var(--premium)"
              labelColor="var(--darkgray)"
            >
              <Credit badge slot="icon" color="var(--darkgray)" />
            </Badge></span
          >
        {/if}
      </div>
    </div>
    {#if description}
      <div class="description">{@html description}</div>
    {/if}
  </div>
</a>

<style>
  .addon-link:hover .container {
    background-color: var(--menuBg);
  }
  .container {
    display: block;
    min-width: 12rem;
    padding: 0.5rem;
    text-align: left;
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
    color: var(--darkgray);
  }

  .description {
    margin: 0 0.5em;
    opacity: 0.6z;
    font-size: 0.875em;
    line-height: 1.4;
    color: var(--darkgray);
    overflow: hidden;
    -webkit-line-clamp: 4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    & > * {
      margin-top: 0;
    }
  }

  .addon-name {
    margin: 0;
    font-weight: 600;
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
