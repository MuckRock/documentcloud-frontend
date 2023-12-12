<script>
  import { _ } from "svelte-i18n";
  import Tooltip from "./Tooltip.svelte";

  // Stores
  import { openAccess as managerOpenAccess } from "@/manager/layout.js";
  import { openAccess as viewerOpenAccess } from "@/viewer/layout.js";
  import { viewer } from "@/viewer/viewer.js";

  // SVG assets
  import privateIconSvg from "@/assets/private_icon.svg?raw";
  import publicIconSvg from "@/assets/public_icon.svg?raw";
  import organizationIconSvg from "@/assets/organization_icon.svg?raw";

  export let document;
  export let showText = false;

  $: openAccess =
    $viewer.document != null ? viewerOpenAccess : managerOpenAccess;

  $: documentAccessString = document.organizationAccess
    ? "accessIcon.organizationExplanation"
    : document.publicAccess
      ? "accessIcon.publicExplanation"
      : "accessIcon.privateExplanation";

  $: documentText = showText
    ? document.organizationAccess
      ? "accessIcon.organization"
      : document.publicAccess
        ? "accessIcon.public"
        : "accessIcon.private"
    : "";
</script>

{#if showText}
  <button
    class="buttonLike"
    class:selectable={document.editAccess}
    on:click={openAccess([document])}
  >
    <span class="access">
      {#if document.privateAccess}
        {@html privateIconSvg}
      {:else if document.publicAccess}
        {@html publicIconSvg}
      {:else if document.organizationAccess}
        {@html organizationIconSvg}
      {/if}
    </span>
    <span class="text">{$_(documentText)}</span>
  </button>
{:else}
  <Tooltip caption={$_(documentAccessString)}>
    <button
      class="access buttonLike"
      class:selectable={document.editAccess}
      on:click={openAccess([document])}
    >
      {#if document.privateAccess}
        {@html privateIconSvg}
      {:else if document.publicAccess}
        {@html publicIconSvg}
      {:else if document.organizationAccess}
        {@html organizationIconSvg}
      {/if}
    </button>
  </Tooltip>
{/if}

<style>
  .access {
    vertical-align: middle;
  }

  .text {
    font-size: 12px;
    color: var(--viewerLink, #004276);
    vertical-align: middle;
    margin-left: 2px;
  }
</style>
