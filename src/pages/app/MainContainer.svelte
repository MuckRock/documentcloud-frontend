<script>
  // Components
  import Documents from "./Documents";
  import Hamburger from "@/common/Hamburger";
  import Modal from "@/common/Modal";
  import ErrorData from "@/common/ErrorData";
  import ErrorModal from "@/common/ErrorModal";
  import ConfirmDialog from "@/common/dialog/ConfirmDialog";
  import MetaDialog from "@/common/dialog/MetaDialog";
  import AccessDialog from "@/common/dialog/AccessDialog";
  import OwnerDialog from "@/common/dialog/OwnerDialog";
  import DataDialog from "@/common/dialog/DataDialog";
  import ProjectEmbedDialog from "@/common/dialog/ProjectEmbedDialog";
  import ProjectDialog from "@/common/dialog/ProjectDialog";
  import CollaboratorDialog from "@/common/dialog/CollaboratorDialog";
  import ProjectAccessDialog from "@/common/dialog/ProjectAccessDialog";
  import SearchTipsDialog from "@/common/dialog/SearchTipsDialog";
  import DiagnosticDialog from "@/common/dialog/DiagnosticDialog";
  import ReprocessDialog from "@/common/dialog/ReprocessDialog";
  import Toasts from "@/common/Toasts";

  import {
    layout,
    hideDocumentInfo,
    hideMeta,
    hideAddonDispatch,
    hideAccess,
    hideOwner,
    hideData,
    hideProjectEmbed,
    hideProject,
    hideReprocess,
    hideCollaborators,
    hideProjectCollaboratorAccess,
    hideSearchTips,
    hideDiagnostics,
  } from "@/manager/layout";
  import { confirmDialog, hideConfirm } from "@/manager/confirmDialog";
  import { documents } from "@/manager/documents";
  import { _ } from "svelte-i18n";

  import emitter from "@/emit";
  import DocumentInformationDialog from "../../common/dialog/DocumentInformationDialog.svelte";
  import AddonDispatchDialog from "../../common/dialog/AddonDispatchTsDialog.svelte";

  export let concealed = false;
  export let embed = false;

  const emit = emitter({
    expandSidebar() {},
  });

  // Iframe resizing
  let containerWidth = null;
  let containerHeight = null;
  let containerElem = null;
</script>

<style lang="scss">
  .main {
    position: absolute;
    left: $sidebar-width;
    right: 0;
    top: 0;
    bottom: 0;
    background: white;
    overflow: auto;

    &.embed {
      left: 0;
    }

    @media only screen and (max-width: $mobileBreak) {
      left: 0;

      &.concealed {
        display: none;
      }
    }
  }

  .container {
    padding: 0 48px $mainDocContainerPadding 48px;

    &.error {
      padding: 100px;
    }
  }
</style>

<div class="main" class:embed class:concealed>
  <Toasts />

  {#if $layout.error}
    <ErrorModal store={$layout} />
  {:else if $confirmDialog.open}
    <Modal component={ConfirmDialog} on:close={hideConfirm} />
  {:else if $layout.documentInfoOpen}
    <Modal component={DocumentInformationDialog} on:close={hideDocumentInfo} />
  {:else if $layout.metaOpen != null}
    <Modal component={MetaDialog} on:close={hideMeta} />
    hideAddonDispatch
  {:else if $layout.addonDispatchOpen}
    <Modal component={AddonDispatchDialog} on:close={hideAddonDispatch} />
  {:else if $layout.accessOpen}
    <Modal component={AccessDialog} on:close={hideAccess} />
  {:else if $layout.ownerOpen}
    <Modal component={OwnerDialog} on:close={hideOwner} />
  {:else if $layout.dataOpen}
    <Modal component={DataDialog} on:close={hideData} />
  {:else if $layout.projectEmbed}
    <Modal component={ProjectEmbedDialog} on:close={hideProjectEmbed} />
  {:else if $layout.projectCollaboratorAccessOpen}
    <Modal
      component={ProjectAccessDialog}
      on:close={hideProjectCollaboratorAccess}
    />
  {:else if $layout.projectCollaboratorsOpen}
    <Modal component={CollaboratorDialog} on:close={hideCollaborators} />
  {:else if $layout.projectOpen}
    <Modal component={ProjectDialog} on:close={hideProject} />
  {:else if $layout.reprocessOpen}
    <Modal component={ReprocessDialog} on:close={hideReprocess} />
  {:else if $layout.searchTipsOpen}
    <Modal component={SearchTipsDialog} on:close={hideSearchTips} />
  {:else if $layout.diagnosticsOpen}
    <Modal component={DiagnosticDialog} on:close={hideDiagnostics} />
  {/if}
  {#if !embed}
    <Hamburger on:toggle={emit.expandSidebar} />
  {/if}
  {#if !$documents.error}
    <div
      class="container"
      bind:this={containerElem}
      bind:offsetWidth={containerWidth}
      bind:offsetHeight={containerHeight}
    >
      <Documents {embed} {containerElem} {containerWidth} {containerHeight} />
    </div>
  {:else}
    <div class="container error">
      <ErrorData error={$documents.error} refresh={true} homepage={true} />
    </div>
  {/if}
</div>
