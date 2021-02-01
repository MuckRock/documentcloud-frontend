<script>
  // Components
  import SearchBar from "./SearchBar";
  import SearchLink from "./SearchLink";
  import Modal from "@/common/Modal";
  import Button from "@/common/Button";
  import Title from "@/common/Title";
  import Loader from "@/common/Loader";
  import Draggable from "@/common/Draggable";
  import UploadDialog from "./UploadDialog";
  import ActionBar from "./ActionBar";
  import ProcessingBar from "./ProcessingBar";
  import Document from "./Document";
  import NoDocuments from "./NoDocuments";
  import AuthSection from "@/pages/app/AuthSection";
  import SpecialMessage from "@/common/SpecialMessage";
  import Paginator from "./Paginator";
  import EmbedFooter from "./EmbedFooter";

  // Store properties
  import { layout } from "@/manager/layout";
  import { documents } from "@/manager/documents";
  import { search, projectIdUrl } from "@/search/search";
  import {
    orgsAndUsers,
    getUserById,
    getOrgById,
  } from "@/manager/orgsAndUsers";
  import { projects } from "@/manager/projects";
  import { titlecase } from "@/util/string";

  // Animation
  import { flip } from "svelte/animate";

  export let embed = false;
  export let dialog = false;

  let preUploadFiles = [];

  function showUploadModal({ detail: files }) {
    if (files != null) {
      preUploadFiles = Array.from(files);
    } else {
      preUploadFiles = [];
    }
    $layout.uploading = true;
  }

  let title = "Your Documents";

  $: {
    let newTitle = "Search Results";
    if (
      $search.params != null &&
      !$search.params.isSearch &&
      $search.params.noStatus &&
      $search.params.oneOrZeroAccesses
    ) {
      let access = $search.params.oneAccessSearch;
      if (access == null) {
        access = "";
      } else {
        access = `${titlecase(access)} `;
      }

      if ($search.params.oneUserSearch != null) {
        // Show title based on a single user search
        if (
          $orgsAndUsers.loggedIn &&
          $search.params.oneUserSearch == $orgsAndUsers.me.id
        ) {
          newTitle = `Your ${access}Documents`;
        } else {
          // Show title based on a single user search
          const user = $orgsAndUsers.usersById[$search.params.oneUserSearch];
          if (user != null) {
            newTitle = `${user.name}’s ${access}Documents`;
          } else {
            getUserById($search.params.oneUserSearch);
          }
        }
      } else if ($search.params.oneProjectSearch != null) {
        // Show title based on a single project search
        const projs = $projects.projects.filter(
          (project) => project.id == $search.params.oneProjectSearch,
        );
        if (projs.length > 0) {
          newTitle = projs[0].title;
        }
      } else if ($search.params.oneOrgSearch != null) {
        // Show title based on a single user search
        const org = $orgsAndUsers.orgsById[$search.params.oneOrgSearch];
        if (org != null) {
          newTitle = `${org.name}’s ${access}Documents`;
        } else {
          getOrgById($search.params.oneOrgSearch);
        }
      } else if ($search.params.isAllSearch) {
        newTitle = `All ${access}Documents`;
      }
    }
    title = newTitle;
  }
</script>

<style lang="scss">
  .docscontainer {
    margin-top: 17px;
    margin-left: -25px;
    position: relative;

    .inlinecard {
      display: inline-block;
      vertical-align: top;
      width: 300px;

      @media only screen and (max-width: $mobileBreak) {
        width: 240px;

        @media only screen and (max-width: 550px) {
          width: 200px;
        }
      }
    }

    :global(.outer) {
      padding-bottom: 28px;
    }

    :global(.dragging) {
      &::after {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: $primary-faded;
        border: 2px solid $primary;
        pointer-events: none;
      }

      :global(.toastouter) {
        visibility: visible;
      }
    }
  }

  .sticky {
    padding-top: $mainDocContainerPadding;
    background: white;
    z-index: $appStickyZ;

    @media only screen and (max-width: $mobileBreak) {
      padding-top: 0;
    }

    &.embed {
      padding-top: $mainDocContainerPadding;
      position: relative;
    }
  }

  .toastouter {
    visibility: hidden;
    text-align: center;
    position: sticky;
    position: -webkit-sticky;
    bottom: 0;
    z-index: $toastOuterZ;
    pointer-events: none;
  }

  .toast {
    position: sticky;
    position: -webkit-sticky;
    bottom: 5px;
    display: inline-block;
    background: $primary;
    color: white;
    border-radius: 3px;
    box-shadow: $overlay-shadow;
    padding: 13px 55px;
  }

  .narrowshow {
    display: none;

    > :global(div) {
      margin-top: -50px;
      margin-bottom: 28px;
      display: block !important;
      text-align: center !important;
    }
  }

  @media only screen and (max-width: $mobileBreak) {
    .narrowshow {
      display: block;
    }
  }
</style>

<Loader active={$layout.loading}>
  <div class="documents">
    <div class="sticky" class:embed>
      {#if !embed}
        {#if $layout.uploading && !$layout.error}
          <Modal
            on:close={() => ($layout.uploading = false)}
            component={UploadDialog}
            properties={{ initialFiles: preUploadFiles }}
          />
        {/if}

        {#if $orgsAndUsers.loggedIn}
          <SpecialMessage tipoftheday={true} />
        {/if}
        <AuthSection />
      {/if}
      {#if !dialog && embed && $search.params != null && $search.params.projectEmbedId != null}
        <!-- Use a search link -->
        <SearchLink link={projectIdUrl($search.params.projectEmbedId)} />
      {:else if !embed || dialog}
        <!-- Don't show search bar in embed (for now) -->
        <SearchBar {embed} {dialog} />
      {/if}

      <div>
        {#if !embed}
          <Title>{title}</Title>
          {#if $orgsAndUsers.loggedIn}
            <Button on:click={showUploadModal}>+ Upload</Button>
          {/if}
        {/if}
      </div>
      {#if !embed}
        <ActionBar />

        <ProcessingBar />
      {/if}
    </div>

    <div class="docscontainer">
      <Draggable
        on:files={showUploadModal}
        disabled={embed || !$orgsAndUsers.loggedIn}
      >
        {#each $documents.documents as document (document.id)}
          <div class:inlinecard={embed} animate:flip={{ duration: 400 }}>
            <Document {embed} {dialog} {document} on:pick />
          </div>
        {/each}
        {#if $documents.documents.length == 0 && !$layout.loading}
          <NoDocuments />
        {/if}
        {#if $orgsAndUsers.loggedIn}
          <div class="toastouter">
            <div class="toast">Drop file to upload</div>
          </div>
        {/if}
      </Draggable>
    </div>

    {#if embed}
      <EmbedFooter {dialog} />
    {:else}
      <div class="narrowshow">
        <Paginator {dialog} />
      </div>
    {/if}
  </div>
</Loader>
