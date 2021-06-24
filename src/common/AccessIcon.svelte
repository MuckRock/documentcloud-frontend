<script>
  import Tooltip from "@/common/Tooltip";
  import { _ } from "svelte-i18n";

  // Stores
  import { openAccess as managerOpenAccess } from "@/manager/layout";
  import { openAccess as viewerOpenAccess } from "@/viewer/layout";
  import { viewer } from "@/viewer/viewer";

  // SVG assets
  import privateIconSvg from "@/assets/private_icon.svg";
  import publicIconSvg from "@/assets/public_icon.svg";
  import organizationIconSvg from "@/assets/organization_icon.svg";

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

<style lang="scss">
  .selectable {
    @include buttonLike;
  }

  .access {
    vertical-align: middle;
  }

  .text {
    font-size: 12px;
    color: $viewerLink;
    vertical-align: middle;
    margin-left: 2px;
  }
</style>

{#if showText}
  <span
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
  </span>
{:else}
  <Tooltip caption={$_(documentAccessString)}>
    <span
      class="access"
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
    </span>
  </Tooltip>
{/if}
