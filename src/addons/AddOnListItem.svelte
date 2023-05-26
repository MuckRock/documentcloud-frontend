<script lang="ts" context="module">
  interface Author {
    name?: string;
    avatar?: string;
  }
  export interface AddOnListItem {
    pinned: boolean;
    id: string;
    title: string;
    description?: string;
    author?: Author;
    usage?: number;
  }
</script>

<script lang="ts">
  import Pin from "../common/Pin.svelte";
  import Title from "../common/Title.svelte";
  import AddOnPopularity from "./AddOnPopularity.svelte";
  
  export let id: string = undefined;
  export let pinned = false;
  export let title: string = undefined;
  export let description: string = undefined;
  export let author: Author = {
    name: undefined,
    avatar: undefined
  };
  export let usage: number = undefined;

  $: handlePinClick = () => {
    pinned = !pinned;
    console.log(`${pinned ? 'Pinning' : 'Unpinning'} ${id}…`);
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
    gap: .5rem;
    margin: .5rem;
  }

  .metadata {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
  }

  .description {
    margin: .5rem;
    opacity: .6z;
    font-size: .875em;
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

<div class="container" id={id}>
  <div class="top-row">
    <div class="center-self"><Pin active={pinned} on:click={handlePinClick} /></div>
    <div class="stretch"><Title>{title}</Title></div>
    <div class="metadata">
      {#if author}
      <p>{author.name}</p>
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
