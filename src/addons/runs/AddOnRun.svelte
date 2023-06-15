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
  export let run: Run;
</script>

<style></style>

<div class="addon-run" id="run-{run.uuid}">
  <h3>
    {run.addon.name}
  </h3>
  <p class="info">
    {run.status} &bullet; {run.created_at}
  </p>
</div>
