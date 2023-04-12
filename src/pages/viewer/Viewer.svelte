<script>
  import Header from "./header/Header";
  import Body from "./Body";
  import SimpleBody from "./SimpleBody";
  import NoteBody from "./NoteBody";
  import ThumbnailBody from "./ThumbnailBody";
  import Sidebar from "./Sidebar";
  import Footer from "./Footer";
  import NotFound from "@/pages/NotFound";
  import Toasts from "@/common/Toasts";
  import Progress from "@/common/Progress";
  import Button from "@/common/Button";
  import { embedUrl } from "@/api/embed";
  import { orgsAndUsers, initOrgsAndUsers } from "@/manager/orgsAndUsers.js";
  import { _ } from "svelte-i18n";

  // Dialogs
  import ConfirmDialog from "@/common/dialog/ConfirmDialog";
  import { confirmDialog, hideConfirm } from "@/manager/confirmDialog";
  import { viewerEditDialogs } from "./viewerEditDialogs";

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
    hideInsertDialog,
    forceReprocess,
  } from "@/viewer/layout";
  import { doc, showAnnotation } from "@/viewer/document";
  import { viewer } from "@/viewer/viewer";
  import { pageImageUrl } from "@/api/viewer";
  import { onMount } from "svelte";

  let shareOption = null;

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

    if (!$viewer.embed) {
      initOrgsAndUsers().then(console.log);
    }
  });
</script>

<svelte:head>
  {#if $viewer.loaded}
    <!-- Insert canonical URL -->
    <link rel="canonical" href={$viewer.document.canonicalUrl} />

    {#if $viewer.document && $viewer.document.noindex}
      <meta name="robots" content="noindex" />
    {/if}
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
      title={$viewer.document.title}
    />
    {#if $viewer.document.description != null && $viewer.document.description.trim().length > 0}
      <meta property="og:description" content={$viewer.document.description} />
    {/if}
    <meta
      property="og:image"
      content={pageImageUrl($viewer.document, 0, 700, 1)}
    />
  {/if}

  {#if !$viewer.embed && $orgsAndUsers.me !== null}<script
      defer
      data-domain="documentcloud.org"
      src="https://plausible.io/js/script.js"></script>{/if}
</svelte:head>

{#if $layout.error}
  <ErrorModal store={$layout} />
{:else if $viewer.error}
  <ErrorModal store={$viewer} refresh={true} />
{:else if $confirmDialog.open}
  <Modal component={ConfirmDialog} on:close={hideConfirm} />
{:else if $layout.showEmbedDialog}
  <Modal
    fullscreen={$layout.embedShareOption == "document"}
    component={$viewerEditDialogs.embedDialog}
    on:close={hideEmbedFlow}
    bind:shareOption
  />
{:else if $layout.showAccess}
  <Modal component={$viewerEditDialogs.accessDialog} on:close={hideAccess} />
{:else if $layout.showInfo}
  <Modal
    component={$viewerEditDialogs.documentInformationDialog}
    on:close={hideDocumentInfo}
  />
{:else if $layout.showData}
  <Modal
    component={$viewerEditDialogs.dataDialog}
    on:close={hideDocumentData}
  />
{:else if $layout.showEditSections}
  <Modal
    component={$viewerEditDialogs.editSectionsDialog}
    on:close={hideEditSections}
  />
{:else if $layout.showInsertDialog}
  <Modal
    component={$viewerEditDialogs.documentPickerDialog}
    on:close={hideInsertDialog}
  />
{/if}

{#if $viewer.show404}
  <NotFound title={$_("viewer.notFound")} message={$_("viewer.notFoundDesc")} />
{:else if $viewer.document != null && $viewer.document.pending}
  <NotFound
    title={$_("viewer.processing")}
    message={$_("viewer.processingDesc")}
  >
    <Progress initializing={true} progress={0} compact={true} />
  </NotFound>
{:else if $viewer.document != null && $viewer.document.error}
  <NotFound title={$_("viewer.error")} message={$_("viewer.errorDesc")}>
    {#if $viewer.document.editAccess}
      <p><Button on:click={forceReprocess}>Reprocess</Button></p>
    {/if}
  </NotFound>
{:else if $viewer.showPending}
  <NotFound
    title={$_("viewer.accessible")}
    message={$_("viewer.accessibleDesc")}
  />
{:else}
  <Toasts />

  <Loader active={$layout.loading}>
    <Header />
    {#if $doc.mode == "image"}
      <Body mode={$doc.mode} />
    {:else if $doc.mode == "text" || $doc.mode == "search"}
      <SimpleBody />
    {:else if $doc.mode == "notes"}
      <NoteBody />
    {:else if $doc.mode == "thumbnail"}
      <ThumbnailBody />
    {:else if $doc.mode == "modify"}
      <ThumbnailBody modify={true} />
    {/if}
    <Sidebar />
    <Footer />
  </Loader>
{/if}
