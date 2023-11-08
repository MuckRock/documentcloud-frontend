<script lang="ts">
  import { _ } from "svelte-i18n";
  import Tooltip from "./Tooltip.svelte";

  // Stores
  import { openAccess as managerOpenAccess } from "../manager/layout.js";
  import { openAccess as viewerOpenAccess } from "../viewer/layout.js";
  import { viewer } from "../viewer/viewer.js";

  // SVG assets
  import { Globe16, Organization16, Lock16 } from "svelte-octicons";

  export let access; // "private" | "organization" | "public"
  export let editable = false;
  export let showText = false;

  $: openAccess =
    $viewer.document != null ? viewerOpenAccess : managerOpenAccess;

  const uiText = {
    public: {
      icon: Globe16,
      tooltip: "accessIcon.publicExplanation",
      visible: "accessIcon.public",
    },
    organization: {
      icon: Organization16,
      tooltip: "accessIcon.organizationExplanation",
      visible: "accessIcon.organization",
    },
    private: {
      icon: Lock16,
      tooltip: "accessIcon.privateExplanation",
      visible: "accessIcon.private",
    },
  };
</script>

<Tooltip
  caption={$_(uiText[access].tooltip) + (editable ? ". Click to edit" : "")}
>
  <button
    class="access buttonLike"
    class:editable
    disabled={!editable}
    on:click={() => openAccess([document])}
  >
    <svelte:component this={uiText[access].icon} />
    {#if showText}<span class="text">{$_(uiText[access].visible)}</span>{/if}
  </button>
</Tooltip>

<style>
  .access {
    display: flex;
    align-items: center;
    gap: 0.25em;
    cursor: default;
  }

  .access:hover {
    opacity: 1;
  }

  .editable {
    cursor: pointer;
  }

  .editable:hover {
    opacity: var(--hover-opacity);
  }

  .text {
    font-size: 12px;
    color: var(--viewerLink, #004276);
    vertical-align: middle;
    margin-left: 2px;
  }
</style>
