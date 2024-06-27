<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { _ } from "svelte-i18n";

  import Button from "$lib/components/common/Button.svelte";
  import RelativeTime from "@/common/RelativeTime.svelte";
  import { Download16, History24 } from "svelte-octicons";
  import Empty from "../common/Empty.svelte";

  export let document: Document;

  $: revisions = document.revisions || [];
</script>

<table class="revisions">
  {#each revisions as revision}
    <tr class="revision">
      <td class="revision-version count">{revision.version}</td>
      <td class="revision-details">
        <p class="revision-comment">{revision.comment}</p>
        <span class="revision-time">
          <RelativeTime date={new Date(revision.created_at)} />
        </span>
      </td>
      <td class="revision-download">
        <Button mode="ghost" href={revision.url}>
          <Download16 />
          {$_("dialogRevisionsDialog.download")}
        </Button>
      </td>
    </tr>
  {:else}
    <tr class="empty"><td>
      <Empty icon={History24}>
        {$_("dialogRevisionsDialog.empty")}
      </Empty>
    </td></tr>
  {/each}
</table>

<style>
  .revisions {
    width: 100%;
    border-collapse: collapse;
    border-radius: .5rem;
    overflow: hidden;
  }
  .revision {
    vertical-align: baseline;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  .revision:last-child {
    border-bottom: none;
  }
  .revision td {
    padding: 0.5rem 1rem;
  }
  .empty td {
    padding: 1rem;
    text-align: center;
  }
  .revision-details {
    width: auto;
    font-size: 0.875em;
  }
  .revision-comment {
    margin: 0;
  }
  .revision-time {
    opacity: 0.5;
    font-size: 0.875em;
  }
  .revision-version {
    background-color: rgba(0 0 0 / 0.05);
  }
  .revision-download {
    text-align: right;
  }
  .count {
    font-family: monospace;
    font-size: 0.75em;
    text-align: right;
    opacity: 0.5;
    text-transform: uppercase;
    font-weight: 600;
  }
</style>
