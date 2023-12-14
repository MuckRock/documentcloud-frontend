<script lang="ts">
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import { getMe } from "../../api/orgAndUser.js";
  import {
    isOrgAdmin,
    isPremiumOrg,
    triggerPremiumUpgradeFlow,
  } from "../../manager/orgsAndUsers.js";
  import UpgradePrompt from "../../premium-credits/UpgradePrompt.svelte";
  import PremiumBadge from "../../premium-credits/PremiumBadge.svelte";
  import Button from "../Button.svelte";
  import ErrorMessage from "../ErrorMessage.svelte";
  import type { Revision } from "../RevisionIcon.svelte";
  import RelativeTime from "../RelativeTime.svelte";
  import Loader from "../Loader.svelte";

  export let documentId: string;
  export let enabled: boolean = false;
  export let revisions: Revision[] | null = [];
  export let onSave: (enabled: boolean) => void;
  export let onCancel: () => void;

  $: sortedRevisions =
    revisions?.sort((a, b) => {
      return b.version - a.version;
    }) ?? null;

  let user;
  let loading = false;
  let error;

  async function load() {
    loading = true;
    try {
      user = await getMe();
    } catch {
      error = true;
    }
    loading = false;
  }

  onMount(load);
</script>

<Loader active={loading}>
  {#if error}
    <div class="mcontent">
      <ErrorMessage message={$_("dialogRevisionsDialog.error")}
        ><Button caution action on:click={load}>Retry</Button></ErrorMessage
      >
    </div>
  {:else}
    <div class="mcontent">
      <header>
        <h3>{$_("dialogRevisionsDialog.heading")}</h3>
        <PremiumBadge />
      </header>

      {#if Array.isArray(revisions)}
        <div class="overflow-scroll">
          <table class="revisions">
            {#each sortedRevisions as revision}
              <tr class="revision">
                <td class="revision-version count">{revision.version}</td>
                <td class="revision-details">
                  <p class="revision-comment">{revision.comment}</p>
                  <span class="revision-time"
                    ><RelativeTime date={new Date(revision.created_at)} /></span
                  >
                </td>
                <td class="revision-download"
                  ><Button href={revision.url} download nomargin
                    >{$_("dialogRevisionsDialog.download")}</Button
                  ></td
                >
              </tr>
            {:else}
              <tr class="empty"><td>{$_("dialogRevisionsDialog.empty")}</td></tr
              >
            {/each}
          </table>
        </div>
        {#if revisions.length > 0}<p class="count">
            {$_("dialogRevisionsDialog.total", {
              values: { n: revisions.length },
            })}
          </p>{/if}
      {/if}

      {#if isPremiumOrg(user?.organization)}
        <form
          on:submit={(event) => {
            event.preventDefault();
          }}
        >
          <label class="revision-control-input">
            <input
              type="checkbox"
              name="revision_control"
              bind:checked={enabled}
            />
            {$_("dialogRevisionsDialog.controlLabel")}
          </label>
          <div class="buttons">
            <Button on:click={() => onSave(enabled)}>{$_("dialog.save")}</Button
            >
            <Button secondary={true} on:click={onCancel}>
              {$_("dialog.cancel")}
            </Button>
          </div>
        </form>
      {:else if isOrgAdmin(user)}
        <UpgradePrompt
          message={$_("dialogRevisionsDialog.upgrade.message")}
          callToAction={$_("dialogRevisionsDialog.upgrade.adminCta")}
          on:click={() => triggerPremiumUpgradeFlow(user?.organization)}
        />
      {:else}
        <UpgradePrompt
          message={$_("dialogRevisionsDialog.upgrade.message") +
            " " +
            $_("dialogRevisionsDialog.upgrade.nonAdminCta")}
        />
      {/if}
    </div>
  {/if}
</Loader>

<style>
  .mcontent {
    margin-bottom: 2rem;
  }
  header {
    display: flex;
    gap: 1em;
    justify-content: space-between;
    align-items: center;
  }
  .revision-control-input {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    margin: 1rem 0;
  }
  .revisions {
    width: 100%;
    border-collapse: collapse;
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
  .overflow-scroll {
    display: block;
    width: 100%;
    max-height: 18rem;
    overflow-y: auto;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: var(--radius);
  }
  .count {
    font-family: monospace;
    font-size: 0.75em;
    text-align: right;
    opacity: 0.5;
    text-transform: uppercase;
    font-weight: 600;
  }
  .buttons {
    display: flex;
    gap: 1rem;
  }
</style>
