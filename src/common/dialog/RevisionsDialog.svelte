<script lang="ts">
  import { changeRevisionControl } from "../../api/document.js";
  import Button from "../../common/Button.svelte";
  import type { Revision } from "../RevisionIcon.svelte";
  import RelativeTime from "../RelativeTime.svelte";

  export let enabled: boolean;
  export let documentId: string;
  export let revisions: Revision[] = [];

  $: sortedRevisions = revisions.sort((a, b) => {
    return b.version - a.version;
  });

  async function handleRevisionControlChange(event: Event) {
    const checkbox = event.currentTarget as HTMLInputElement;
    const value = checkbox.checked;
    changeRevisionControl([documentId], value);
  }

  import { getMe } from "../../api/orgAndUser.js";
  import {
    isOrgAdmin,
    isPremiumOrg,
    triggerPremiumUpgradeFlow,
  } from "../../manager/orgsAndUsers.js";
  import UpgradePrompt from "../../premium-credits/UpgradePrompt.svelte";
  import Error from "../../common/icons/Error.svelte";
  import PremiumBadge from "../../premium-credits/PremiumBadge.svelte";
</script>

<header>
  <h3>Revision History</h3>
  <PremiumBadge />
</header>
{#await getMe() then user}
  {#if isPremiumOrg(user.organization)}
    <form>
      <label class="revision-control-input">
        <input
          type="checkbox"
          name="revision_control"
          checked={enabled}
          on:change={handleRevisionControlChange}
        />
        Revision Control
      </label>
    </form>
    {#if enabled}
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
                ><Button href={revision.url} download nomargin>Download</Button
                ></td
              >
            </tr>
          {:else}
            <tr class="empty"><td>No revisions found</td></tr>
          {/each}
        </table>
      </div>
      {#if revisions.length > 0}<p class="count">
          {revisions.length} total
        </p>{/if}
    {/if}
  {:else if isOrgAdmin(user)}
    <UpgradePrompt
      message="Pro and Organization users can record and access the entire version history of their documents. Upgrade today!"
      callToAction="Upgrade"
      on:click={() => triggerPremiumUpgradeFlow(user?.organization)}
    />
  {:else}
    <UpgradePrompt
      message="Pro and Organization users can record and access the entire version history of their documents. Contact your organization administrator about upgrading your account."
    />
  {/if}
{:catch}
  <!-- Error state -->
  <div class="error">
    <div class="errorIcon"><Error /></div>
    <p>An error occurred</p>
  </div>
{/await}

<style>
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
  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    font-weight: 600;
    font-size: 0.875em;
    color: var(--caution);
  }

  .errorIcon {
    text-align: center;
    height: 3em;
    width: 3em;
  }
</style>
