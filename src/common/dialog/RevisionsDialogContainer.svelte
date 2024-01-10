<script lang="ts">
  import { changeRevisionControlForDocument } from "../../manager/documents";
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
  const onSave = async (enabled: boolean) => {
    await changeRevisionControlForDocument(document, enabled);
    emit.dismiss();
  };
  const onCancel = () => {
    emit.dismiss();
  };
</script>

<RevisionsDialog {documentId} {revisions} {enabled} {onSave} {onCancel} />
