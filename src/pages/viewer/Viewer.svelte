<script>
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";

  import Header from "./Header.svelte";
  import Body from "./Body.svelte";
  import SimpleBody from "./SimpleBody.svelte";
  import NoteBody from "./NoteBody.svelte";
  import ThumbnailBody from "./ThumbnailBody.svelte";
  import Sidebar from "./Sidebar.svelte";
  import Footer from "./Footer.svelte";
  import NotFound from "@/pages/NotFound.svelte";
  import Toasts from "@/common/Toasts.svelte";
  import Progress from "@/common/Progress.svelte";
  import Button from "@/common/Button.svelte";

  import { embedUrl } from "@/api/embed.js";
  import { orgsAndUsers, initOrgsAndUsers } from "@/manager/orgsAndUsers.js";

  // Dialogs
  import ConfirmDialog from "@/common/dialog/ConfirmDialog.svelte";
  import { confirmDialog, hideConfirm } from "@/manager/confirmDialog.js";
  import { viewerEditDialogs } from "./viewerEditDialogs.js";

  import Modal from "@/common/Modal.svelte";
  import ErrorModal from "@/common/ErrorModal.svelte";
  import Loader from "@/common/Loader.svelte";
  import {
    layout,
    setViewerInitializeAction,
    hideEmbedFlow,
    hideAccess,
    hideDocumentInfo,
    hideDocumentData,
    hideEditSections,
    hideRevisions,
    hideInsertDialog,
    forceReprocess,
  } from "@/viewer/layout.js";
  import { doc, showAnnotation } from "@/viewer/document.js";
  import { viewer } from "@/viewer/viewer.js";
  import { pageImageUrl } from "@/api/viewer.js";

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

  onMount(async () => {
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
      await initOrgsAndUsers();

      window.plausible && plausible("pageview", { u: obscureURL() });

      // debug
      window.layout = layout;
      window.doc = doc;
      window.viewer = viewer;
    }
  });

  // create a URL that won't leak the document slug
  function obscureURL() {
    const u = new URL(window.location);
    const path_re = /documents\/(\d+)-(.+)/;

    // if we're somehow not on a normal doc URL
    if (!path_re.test(u.pathname)) {
      return u.href;
    }

    const [p, id, slug] = path_re.exec(u.pathname);
    u.pathname = u.pathname.replace(slug, "obscure");

    return u.toString();
  }
</script>

<svelte:head>
  {#if $viewer.loaded}
    <!-- Insert canonical URL -->
    <link rel="canonical" href={$viewer.document.canonicalUrl} />

    {#if $viewer.document && ($viewer.document.noindex || $viewer.document.adminNoindex)}
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
      src="https://plausible.io/js/script.manual.tagged-events.js"
    ></script>{/if}
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
{:else if $layout.showRevisions}
  <Modal
    component={$viewerEditDialogs.revisionsDialog}
    on:close={hideRevisions}
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
    <Header
      document={$viewer.document}
      loaded={$viewer.loaded}
      title={$layout.title}
      showOrg={$layout.title}
      disableControls={$layout.disableControls}
      embed={$viewer.embed}
      sidebarOpen={$layout.showSidebar}
      on:toggle.sidebar={($layout.showSidebar = !$layout.showSidebar)}
    />
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

    <Sidebar
      document={$viewer.document}
      signedIn={$viewer.me !== null}
      loaded={$viewer.loaded}
      embed={$layout.embed}
      hidePdfLink={$layout.hidePdfLink}
      showOrg={$layout.showOrg}
      displayAnnotate={$layout.displayAnnotate}
      disableControls={$layout.disableControls}
      show={$layout.showSidebar}
    />

    <Footer
      disableControls={$layout.disableControls}
      compact={$layout.compact}
      embed={$layout.embed}
      showFullscreen={$layout.showFullscreen}
      document={$viewer.document}
    />
  </Loader>
{/if}
