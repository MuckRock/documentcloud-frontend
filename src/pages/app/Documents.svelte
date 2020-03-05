<script>
  // Components
  import SearchBar from "./SearchBar";
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

  // Store properties
  import { layout } from "@/manager/layout";
  import { documents } from "@/manager/documents";
  import { search } from "@/search/search";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";
  import { projects } from "@/manager/projects";
  import { titlecase } from "@/util/string";

  // Animation
  import { flip } from "svelte/animate";

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
          $orgsAndUsers.me != null &&
          $search.params.oneUserSearch == $orgsAndUsers.me.id
        ) {
          newTitle = `Your ${access}Documents`;
        } else {
          const users = $orgsAndUsers.allUsers.filter(
            user => user.id == $search.params.oneUserSearch
          );
          if (users.length > 0) {
            newTitle = `${users[0].name}’s ${access}Documents`;
          }
        }
      } else if ($search.params.oneProjectSearch != null) {
        // Show title based on a single project search
        const projects = $projects.projects.filter(
          project => project.id == $search.params.oneProjectSearch
        );
        if (projects.length > 0) {
          newTitle = projects[0].title;
        }
      } else if ($search.params.oneOrgSearch != null) {
        // Show title based on a single organization search
        const organizations = $orgsAndUsers.organizations.filter(
          org => org.id == $search.params.oneOrgSearch
        );
        if (organizations.length > 0) {
          newTitle = `${organizations[0].name}’s ${access}Documents`;
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
    <div class="sticky">
      {#if $layout.uploading && !$layout.error}
        <Modal
          on:close={() => ($layout.uploading = false)}
          component={UploadDialog}
          properties={{ initialFiles: preUploadFiles }} />
      {/if}

      <SpecialMessage />
      <AuthSection />
      <SearchBar />

      <div>
        <Title>{title}</Title>
        <Button on:click={showUploadModal}>+ Upload</Button>
      </div>
      <ActionBar />

      <ProcessingBar />
    </div>

    <div class="docscontainer">
      <Draggable on:files={showUploadModal}>
        {#each $documents.documents as document (document.id)}
          <div animate:flip={{ duration: 400 }}>
            <Document {document} />
          </div>
        {/each}
        {#if $documents.documents.length == 0 && !$layout.loading}
          <NoDocuments />
        {/if}
        <div class="toastouter">
          <div class="toast">Drop file to upload</div>
        </div>
      </Draggable>
    </div>

    <div class="narrowshow">
      <Paginator />
    </div>
  </div>
</Loader>
