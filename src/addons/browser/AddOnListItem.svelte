<script lang="ts" context="module">
  import { writable, type Writable } from "svelte/store";

  interface Author {
    name?: string;
    avatar?: string;
  }

  // API endpoint https://api.www.documentcloud.org/api/addons/
  export interface AddOnListItem {
    id: number;
    name: string;
    repository: string;
    parameters: any;
    description?: string;
    author?: Author;
    usage?: number;
    categories: string[];
    documents: string[];
    active: boolean;
    featured: boolean;
    default: boolean;
  }

  export const pinned: Writable<AddOnListItem[]> = writable([]);
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import { baseApiUrl } from "../../api/base.js";
  import { getCsrfToken } from "../../api/session.js";

  import Pin from "../../common/Pin.svelte";
  import AddOnPopularity from "../Popularity.svelte";

  export let addon: AddOnListItem;

  $: endpoint = new URL(`/api/addons/${addon.id}/`, baseApiUrl);
  $: description = addon.parameters?.description;
  $: if (!addon?.author) {
    addon.author = { name: addon?.repository?.split("/")[0] };
  }

  $: url = `#add-ons/${addon.repository}`;

  async function toggle(event) {
    event.preventDefault();

    const csrftoken = getCsrfToken();
    const options: RequestInit = {
      credentials: "include",
      method: "PATCH", // this component can only update whether an addon is active or not
      headers: { "X-CSRFToken": csrftoken, "Content-type": "application/json" },
    };

    // optimistic update
    addon.active = !addon.active;

    const resp = await fetch(endpoint, {
      ...options,
      body: JSON.stringify({ active: addon.active }),
    }).catch((err) => {
      addon.active = !addon.active;
      return {
        ok: false,
        statusText: String(err),
      };
    });

    if (!resp.ok) {
      // reset active state
      addon.active = !addon.active;
      console.error(`Problem updating add-on: ${resp.statusText}`);
    }

    // now that we've updated, set $pinned
    $pinned = addon.active
      ? [...$pinned, addon]
      : $pinned.filter((a) => a.id !== addon.id);
  }
</script>

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

  .top-row {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    margin: 0.5rem;
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

<a class="addon-link" href={url}>
  <div class="container" id={addon.repository}>
    <div class="top-row">
      <div class="center-self">
        <Pin active={addon.active} on:click={toggle} />
      </div>
      <div class="stretch">
        <h3 class="addon-name">{addon.name}</h3>
      </div>
      <div class="metadata">
        {#if addon?.author?.name}
          <p class="author">
            <a
              href="http://github.com/{addon.repository}"
              target="_blank"
              rel="noopener noreferrer"
              title={$_("addonBrowserDialog.viewsource")}>{addon.author.name}</a
            >
          </p>
        {/if}
        {#if addon.usage}
          <AddOnPopularity useCount={addon.usage} />
        {/if}
      </div>
    </div>
    {#if description}
      <div class="description">{@html description}</div>
    {/if}
  </div>
</a>
