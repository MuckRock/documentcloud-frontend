<script>
  // Components
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

  // Store properties
  import { layout } from "@/manager/layout";
  import { documents } from "@/manager/documents";

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
</style>

<Loader active={$layout.loading}>
  <div class="documents">
    {#if $layout.uploading}
      <Modal
        on:close={() => ($layout.uploading = false)}
        component={UploadDialog}
        properties={{ initialFiles: preUploadFiles }} />
    {/if}
    <div>
      <Title>Your documents</Title>
      <Button on:click={showUploadModal}>+ Upload</Button>
    </div>
    <ActionBar />

    <ProcessingBar />

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
  </div>
</Loader>
