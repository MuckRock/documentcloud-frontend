<script lang="ts" context="module">
  interface Author {
    name?: string;
    avatar?: string;
  }

  // API endpoint https://api.www.documentcloud.org/api/addons/
  export interface AddOnListItem {
    active: boolean;
    id: number;
    name: string;
    repository: string;
    parameters: any;
    description?: string;
    author?: Author;
    usage?: number;
    categories: string[];
    featured: boolean;
    default: boolean;
  }
</script>

<script lang="ts">
  import Pin from "../../common/Pin.svelte";
  import Title from "../../common/Title.svelte";
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

  $: description = parameters?.description;
  $: if (!author.name) {
    author.name = repository.split("/")[0];
  }

  function onClick(e) {
    active = !active;
    console.log(`${active ? "Pinning" : "Unpinning"} ${id}...`);
  }
</script>

<style>
  .container {
    display: block;
    min-width: 12rem;
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
  }

  .description {
    margin: 0.5rem;
    opacity: 0.6z;
    font-size: 0.875em;
    line-height: 1.4;
  }

  .center-self {
    align-self: center;
  }

  .stretch {
    flex: 1 1 auto;
  }

  p {
    margin: 0;
  }
</style>

<div class="container" id={repository}>
  <div class="top-row">
    <div class="center-self">
      <Pin {active} on:click={onClick} />
    </div>
    <div class="stretch"><Title>{name}</Title></div>
    <div class="metadata">
      {#if author && author.name}
        <p>
          <a
            href="http://github.com/{repository}"
            target="_blank"
            rel="noopener noreferrer"
            title="view source">{author.name}</a
          >
        </p>
      {/if}
      {#if usage}
        <AddOnPopularity useCount={usage} />
      {/if}
    </div>
  </div>
  {#if description}
    <p class="description">{description}</p>
  {/if}
</div>
