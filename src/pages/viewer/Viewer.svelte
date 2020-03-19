<script>
  import Header from "./header/Header";
  import Body from "./Body";
  import Sidebar from "./Sidebar";
  import Footer from "./Footer";

  // Dialogs
  import ConfirmDialog from "@/common/dialog/ConfirmDialog";
  import { confirmDialog, hideConfirm } from "@/manager/confirmDialog";
  import EmbedDialog from "@/common/dialog/EmbedDialog";
  import EditSectionsDialog from "@/common/dialog/EditSectionsDialog";

  import Modal from "@/common/Modal";
  import ErrorModal from "@/common/ErrorModal";
  import Loader from "@/common/Loader";
  import { layout, hideEmbedFlow, hideEditSections } from "@/viewer/layout";
  import { viewer } from "@/viewer/viewer";
</script>

<svelte:head>
  {#if $viewer.loaded}
    <!-- Insert canonical URL -->
    <link
      rel="canonical"
      href={process.env.APP_URL + 'documents/' + $viewer.document.slugId} />
  {/if}
</svelte:head>

{#if $layout.error}
  <ErrorModal store={$layout} />
{:else if $confirmDialog.open}
  <Modal component={ConfirmDialog} on:close={hideConfirm} />
{:else if $layout.showEmbedDialog}
  <Modal fullscreen={true} component={EmbedDialog} on:close={hideEmbedFlow} />
{:else if $layout.showEditSections}
  <Modal component={EditSectionsDialog} on:close={hideEditSections} />
{/if}

<Loader active={$layout.loading}>
  <Header />
  <Body />
  <Sidebar />
  <Footer />
</Loader>
