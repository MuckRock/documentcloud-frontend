<script lang="ts">
  import type { Project } from "../api/types/project";

  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import EmptyResults from "../common/icons/EmptyResults.svelte";
  import Error from "../common/icons/Error.svelte";
  import Loader from "../common/Loader.svelte";
  import ListItem from "./ProjectListItem.svelte";

  import { editProject } from "../manager/layout.js";

  export let items: Project[];
  export let loading: boolean;
  export let error: string | undefined;
  export let reload: () => void | undefined;

  $: empty = !(items && items.length > 0);
</script>

<div class="list" class:empty class:loading class:error>
  {#if loading}
    <!-- Loading state -->
    <Loader active center big pad />
    <p>{$_("projectBrowser.loading")}</p>
  {:else if error}
    <!-- Error state -->
    <div class="icon"><Error /></div>
    <p>{error}</p>
    {#if reload}<Button action on:click={reload}
        >{$_("projectBrowser.retry")}</Button
      >{/if}
  {:else if empty}
    <!-- Empty state -->
    <div class="icon"><EmptyResults /></div>
    <p>{$_("projectBrowser.empty")}</p>
  {:else}
    <ul>
      {#each items as project (project.id)}
        <li><ListItem {project} {editProject} /></li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .list {
    flex: 1 1 auto;
    min-width: 24em;
    display: flex;
    flex-direction: column;
  }

  .empty,
  .error,
  .loading {
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .empty,
  .loading {
    position: relative;
    color: var(--gray);
  }

  .error {
    color: var(--caution);
  }

  .empty .icon,
  .error .icon {
    width: 3em;
    height: auto;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }
</style>
