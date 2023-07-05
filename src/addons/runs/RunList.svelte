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
  import { baseApiUrl } from "../../api/base.js";

  export let runs: Run[] = [];
  export let per_page = 10;

  let previous_url: URL | null;
  let next_url: URL | null;

  const endpoint = new URL("/api/addon_runs/", baseApiUrl);
  const options: RequestInit = {
    credentials: "include",
  };

  export async function load(url?: string | URL) {
    if (!url) {
      url = endpoint;
    }

    if (!(url instanceof URL)) {
      url = new URL(url);
    }

    url.searchParams.set("per_page", String(per_page));

    const resp = await fetch(url, options);

    if (resp.ok) {
      const { next, previous, results } = await resp.json();

      next_url = next ? new URL(next) : null;
      previous_url = previous ? new URL(previous) : null;
      runs = results;
    }
  }

  function loadNext(e) {
    return load(next_url);
  }

  function loadPrevious(e) {
    return load(previous_url);
  }
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
    <Paginator on:next={loadNext} on:previous={loadPrevious} />
  {/if}
</div>
