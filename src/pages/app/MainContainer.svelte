<script>
  import { _ } from "svelte-i18n";

  // Components
  import Documents from "./Documents.svelte";

  import AccessDialog from "@/common/dialog/AccessDialog.svelte";
  import CollaboratorDialog from "@/common/dialog/CollaboratorDialog.svelte";
  import ConfirmDialog from "@/common/dialog/ConfirmDialog.svelte";
  import DataDialog from "@/common/dialog/DataDialog.svelte";
  import DiagnosticDialog from "@/common/dialog/DiagnosticDialog.svelte";
  import DocumentInformationDialog from "@/common/dialog/DocumentInformationDialog.svelte";
  import MetaDialog from "@/common/dialog/MetaDialog.svelte";
  import OwnerDialog from "@/common/dialog/OwnerDialog.svelte";
  import ProjectDialog from "@/common/dialog/ProjectDialog.svelte";
  import ProjectAccessDialog from "@/common/dialog/ProjectAccessDialog.svelte";
  import ProjectEmbedDialog from "@/common/dialog/ProjectEmbedDialog.svelte";
  import ReprocessDialog from "@/common/dialog/ReprocessDialog.svelte";
  import SearchTipsDialog from "@/common/dialog/SearchTipsDialog.svelte";
  import UploadEmailDialog from "@/common/dialog/UploadEmailDialog.svelte";

  import ErrorData from "@/common/ErrorData.svelte";
  import ErrorModal from "@/common/ErrorModal.svelte";
  import Hamburger from "@/common/Hamburger.svelte";
  import Modal from "@/common/Modal.svelte";
  import Toasts from "@/common/Toasts.svelte";

  // stores
  import {
    layout,
    hideDocumentInfo,
    hideMeta,
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
    hideMailkey,
  } from "@/manager/layout.js";
  import { confirmDialog, hideConfirm } from "@/manager/confirmDialog.js";
  import { documents } from "@/manager/documents.js";

  import emitter from "@/emit.js";

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
  {:else if $layout.mailkeyOpen}
    <Modal component={UploadEmailDialog} on:close={hideMailkey} />
  {/if}
  {#if !embed}
    <Hamburger
      class="plausible-event-name=sidebar-expand"
      on:click={emit.expandSidebar}
    />
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

<style>
  .main {
    position: absolute;
    left: var(--sidebar-width, 272px);
    right: 0;
    top: 0;
    bottom: 0;
    background: white;
    overflow: auto;
  }

  .main.embed {
    left: 0;
  }

  @media only screen and (max-width: 720px) {
    .main {
      left: 0;
    }
    .main.concealed {
      display: none;
    }
  }

  .container {
    padding: 0 48px var(--mainDocContainerPadding, 12px) 48px;
  }

  .container.error {
    padding: 100px;
  }
</style>
