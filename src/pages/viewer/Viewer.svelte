<script>
  import Header from "./header/Header";
  import Body from "./Body";
  import Sidebar from "./Sidebar";
  import Footer from "./Footer";
  import NotFound from "@/pages/NotFound";

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

{#if $viewer.show404}
  <NotFound
    title="Document not found"
    message="The document you requested either does not exist or you lack
    permission to access it" />
{:else}
  <Loader active={$layout.loading}>
    <Header />
    <Body />
    <Sidebar />
    <Footer />
  </Loader>
{/if}
