<script lang="ts">
  import { viewer } from "../../viewer/viewer.js";
  import RevisionsDialog from "./RevisionsDialog.svelte";

  const document = $viewer.document;
  const documentId = document?.id;
  const revisions = document?.revisions;
  const enabled = document?.revisionControl;
</script>

<RevisionsDialog {documentId} {revisions} {enabled} />
