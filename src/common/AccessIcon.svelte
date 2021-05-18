<script>
  import Tooltip from "@/common/Tooltip";

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
    ? "Only members of your organization can view this document"
    : document.publicAccess
    ? "Anyone can search and view this document"
    : "Only you can view this document";

  $: documentText = showText
    ? document.organizationAccess
      ? `Private to Your Organization`
      : document.publicAccess
      ? "Public Access"
      : "Private Access"
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
    <span class="text">{documentText}</span>
  </span>
{:else}
  <Tooltip caption={documentAccessString}>
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
