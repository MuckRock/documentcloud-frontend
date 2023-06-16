<script context="module" lang="ts">
  import type { AddOnListItem } from "../browser/AddOnListItem.svelte";
  // https://api.www.documentcloud.org/api/addon_runs/?expand=addon
  export interface Run {
    uuid: string;
    addon: AddOnListItem;
    user: number;
    status: "success" | "failure";
    progress: number;
    message: string;
    file_url?: string | null;
    dismissed: boolean;
    rating: number;
    comment: string;
    created_at: string;
    updated_at: string;
  }
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";

  import Paginator from "../Paginator.svelte";

  export let runs: Run[] = [];
  export let per_page = 10;

  let previous_url: string;
  let next_url: string;

  export async function load({ per_page = 10, url = "" }) {}
</script>

<style></style>

<div class="run-list">
  <h2>{$_("addonRuns.previous")}</h2>

  {#each runs as run}
    <div class="addon-run" id="run-{run.uuid}">
      <h3>
        {run.addon.name}
      </h3>
      <p class="info">
        {run.status} &bullet; {run.created_at}
      </p>
    </div>
  {/each}

  {#if previous_url || next_url}
    <Paginator />
  {/if}
</div>
