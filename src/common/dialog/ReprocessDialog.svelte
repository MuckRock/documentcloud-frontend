<script>
  import Loader from "@/common/Loader";
  import Button from "@/common/Button";
  import UploadOptions from "@/common/UploadOptions";
  import { layout } from "@/manager/layout";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";
  import { reprocessDocuments } from "@/manager/documents";
  import emitter from "@/emit";
  import { sameProp } from "@/util/array";
  import { _ } from "svelte-i18n";

  const emit = emitter({
    dismiss() {},
  });

  let forceOcr = false;
  let language = layout.sameLanguage;

  async function reprocess(forceOcr, language) {
    reprocessDocuments(layout.reprocessDocuments, forceOcr, language);
    emit.dismiss();
  }
</script>

<style lang="scss">
</style>

<!-- Don't show until self orgs have populated -->
<Loader active={$orgsAndUsers.selfOrgs == null}>
  <div>
    <div class="mcontent">
      <h1>
        {$_("dialogReprocessDialog.title")}
      </h1>
      <p>
        {$_("dialogReprocessDialog.reprocessDocs", {
          values: { n: $layout.numReprocessSelected },
        })}
      </p>

      <p>
        <UploadOptions bind:language bind:forceOcr />
      </p>

      <div class="buttonpadded">
        <Button on:click={() => reprocess(forceOcr, language)}
          >{$_("dialogReprocessDialog.confirm")}</Button
        >
        <Button secondary={true} on:click={emit.dismiss}
          >{$_("dialog.cancel")}</Button
        >
      </div>
    </div>
  </div>
</Loader>
