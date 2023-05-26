<script lang="ts">
  import Pin from "../common/Pin.svelte";
  import Title from "../common/Title.svelte";
  import { nFormatter } from "../util/string";
  import Usage from "../assets/usage.svg";
  import AddOnPopularity from "./AddOnPopularity.svelte";

  interface Author {
    name?: string;
    avatar?: string;
  }

  export let pinned = true;
  export let title: string = undefined;
  export let description: string = undefined;
  export let author = {
    name: undefined,
    avatar: undefined
  };
  export let usage: number = undefined;
</script>

<style>
  .container {
    display: block;
    list-style-type: none;
    min-width: 12rem;
  }

  .top-row {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    margin: .5rem;
  }

  .metadata {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
  }

  .description {
    margin: .5rem;
    opacity: .7;
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

<li class="container">
  <div class="top-row">
    <div class="center-self"><Pin active={pinned} /></div>
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
</li>
