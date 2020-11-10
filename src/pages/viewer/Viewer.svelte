<script>
  import Header from "./header/Header";
  import Body from "./Body";
  import SimpleBody from "./SimpleBody";
  import NoteBody from "./NoteBody";
  import Sidebar from "./Sidebar";
  import Footer from "./Footer";
  import NotFound from "@/pages/NotFound";
  import Toasts from "@/common/Toasts";
  import { embedUrl } from "@/api/embed";

  // Dialogs
  import ConfirmDialog from "@/common/dialog/ConfirmDialog";
  import { confirmDialog, hideConfirm } from "@/manager/confirmDialog";
  import EmbedDialog from "@/common/dialog/EmbedDialog";
  import AccessDialog from "@/common/dialog/AccessDialog";
  import DocumentInformationDialog from "@/common/dialog/DocumentInformationDialog";
  import DataDialog from "@/common/dialog/DataDialog";
  import EditSectionsDialog from "@/common/dialog/EditSectionsDialog";

  import Modal from "@/common/Modal";
  import ErrorModal from "@/common/ErrorModal";
  import Loader from "@/common/Loader";
  import {
    layout,
    setViewerInitializeAction,
    hideEmbedFlow,
    hideAccess,
    hideDocumentInfo,
    hideDocumentData,
    hideEditSections,
  } from "@/viewer/layout";
  import { doc, showAnnotation } from "@/viewer/document";
  import { viewer } from "@/viewer/viewer";
  import { pageImageUrl } from "@/api/viewer";
  import { onMount } from "svelte";

  const navHandlers = [
    [
      /^#document\/p([0-9]+)\/*$/,
      (match) => {
        const pageNumber = parseInt(match[1]);
        doc.jumpToPage(pageNumber - 1);
      },
    ],
    [
      /^#document\/p([0-9]+)\/a([0-9]+)\/*$/,
      async (match) => {
        const pageNumber = parseInt(match[1]);
        const annotationId = match[2];

        // Grab the appropriate annotation by id
        const notes = viewer.notes.filter((x) => x.id == annotationId);
        if (notes.length == 1) {
          // Show and scroll the annotation into view
          // await tick();
          await showAnnotation(notes[0], true);
        } else {
          // Annotation wasn't found: fall back to page number
          await doc.jumpToPage(pageNumber - 1);
        }
      },
    ],
  ];

  onMount(() => {
    const hash = window.location.hash;
    for (let i = 0; i < navHandlers.length; i++) {
      const [regex, handler] = navHandlers[i];
      const match = regex.exec(hash);
      if (match != null) {
        setViewerInitializeAction(() => handler(match));
        return;
      }
    }
  });
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
    <title>{$viewer.document.title} - DocumentCloud</title>
    <link
      rel="alternate"
      type="application/json+oembed"
      href={embedUrl($viewer.document.canonicalUrl)}
      title={$viewer.document.title} />
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
  <Modal component={EmbedDialog} on:close={hideEmbedFlow} />
{:else if $layout.showAccess}
  <Modal component={AccessDialog} on:close={hideAccess} />
{:else if $layout.showInfo}
  <Modal component={DocumentInformationDialog} on:close={hideDocumentInfo} />
{:else if $layout.showData}
  <Modal component={DataDialog} on:close={hideDocumentData} />
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
    {:else if $doc.mode == 'notes'}
      <NoteBody />
    {/if}
    <Sidebar />
    <Footer />
  </Loader>
{/if}
