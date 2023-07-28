<script lang="ts" context="module">
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
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import { baseApiUrl } from "../../api/base.js";
  import { getCsrfToken } from "../../api/session.js";

  import Pin from "../../common/Pin.svelte";
  import AddOnPopularity from "../Popularity.svelte";

  export let id: number = undefined;
  export let active = false;
  export let name: string = undefined;
  export let repository: string = undefined;
  export let parameters: any = {};

  export let description: string = undefined;
  export let author: Author = {
    name: undefined,
    avatar: undefined,
  };
  export let usage: number = undefined;

  $: endpoint = new URL(`/api/addons/${id}/`, baseApiUrl);
  $: description = parameters?.description;
  $: if (!author.name) {
    author.name = repository.split("/")[0];
  }

  $: url = `#add-ons/${repository}`;

  async function toggle(event) {
    event.preventDefault();

    const csrftoken = getCsrfToken();
    const options: RequestInit = {
      credentials: "include",
      method: "PATCH", // this component can only update whether an addon is active or not
      headers: { "X-CSRFToken": csrftoken, "Content-type": "application/json" },
    };

    // optimistic update
    active = !active;
    console.log(`${active ? "Pinning" : "Unpinning"} ${id}...`);

    const resp = await fetch(endpoint, {
      ...options,
      body: JSON.stringify({ active }),
    }).catch((err) => {
      active = !active;
      return {
        ok: false,
        statusText: String(err),
      };
    });

    if (!resp.ok) {
      // reset active state
      active = !active;
      console.error(`Problem updating add-on: ${resp.statusText}`);
    }
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
    margin: 0 .5em;
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
  <div class="container" id={repository}>
    <div class="top-row">
      <div class="center-self">
        <Pin {active} on:click={toggle} />
      </div>
      <div class="stretch">
        <h3 class="addon-name">{name}</h3>
      </div>
      <div class="metadata">
        {#if author && author.name}
          <p class="author">
            <a
              href="http://github.com/{repository}"
              target="_blank"
              rel="noopener noreferrer"
              title={$_("addonBrowserDialog.viewsource")}>{author.name}</a
            >
          </p>
        {/if}
        {#if usage}
          <AddOnPopularity useCount={usage} />
        {/if}
      </div>
    </div>
    {#if description}
      <div class="description">{@html description}</div>
    {/if}
  </div>
</a>
