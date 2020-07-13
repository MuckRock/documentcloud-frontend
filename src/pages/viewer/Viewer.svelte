<script>
  import Header from "./header/Header";
  import Body from "./Body";
  import SimpleBody from "./SimpleBody";
  import TextBody from "./TextBody";
  import Sidebar from "./Sidebar";
  import Footer from "./Footer";
  import NotFound from "@/pages/NotFound";
  import Toasts from "@/common/Toasts";

  // Dialogs
  import ConfirmDialog from "@/common/dialog/ConfirmDialog";
  import { confirmDialog, hideConfirm } from "@/manager/confirmDialog";
  import EmbedDialog from "@/common/dialog/EmbedDialog";
  import EditSectionsDialog from "@/common/dialog/EditSectionsDialog";

  import Modal from "@/common/Modal";
  import ErrorModal from "@/common/ErrorModal";
  import Loader from "@/common/Loader";
  import { layout, hideEmbedFlow, hideEditSections } from "@/viewer/layout";
  import { doc } from "@/viewer/document";
  import { viewer } from "@/viewer/viewer";
  import { pageImageUrl } from "@/api/viewer";
</script>

<svelte:head>
  {#if $viewer.loaded}
    <!-- Insert canonical URL -->
    <link rel="canonical" href={$viewer.document.canonicalUrl} />

    <!-- Social cards -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="og:url" content={$viewer.document.canonicalUrl} />
    <meta property="og:url" content={$viewer.document.canonicalUrl} />
    <meta property="og:title" content={$viewer.document.title} />
    {#if $viewer.document.description != null && $viewer.document.description.trim().length > 0}
      <meta property="og:description" content={$viewer.document.description} />
    {/if}
    <meta
      property="og:image"
      content={pageImageUrl($viewer.document, 0, 700, 1)} />
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
{:else if $viewer.showPending}
  <NotFound
    title="Document not accessible"
    message="The document you requested is still processing or you lack
    permission to access to it" />
{:else}
  <Toasts />

  <Loader active={$layout.loading}>
    <Header />
    {#if $doc.mode == 'image'}
      <Body mode={$doc.mode} />
    {:else if $doc.mode == 'text' || $doc.mode == 'search'}
      <SimpleBody />
    {/if}
    <Sidebar />
    <Footer />
  </Loader>
{/if}
