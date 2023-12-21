<script lang="ts">
  import { changeRevisionControl } from "../../api/document.js";
  import { viewer } from "../../viewer/viewer.js";
  import RevisionsDialog from "./RevisionsDialog.svelte";
  import emitter from "../../emit.js";

  const emit = emitter({
    dismiss() {},
  });

  const document = $viewer.document;
  const documentId = document?.id;
  const revisions = document?.revisions;
  const enabled = document?.revisionControl;
  const onSave = (enabled: boolean) =>
    changeRevisionControl([documentId], enabled);
  const onCancel = () => emit.dismiss();
</script>

<RevisionsDialog {documentId} {revisions} {enabled} {onSave} {onCancel} />
