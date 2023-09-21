<script>
  import { _ } from "svelte-i18n";

  import Button from "@/common/Button.svelte";
  import Loader from "@/common/Loader.svelte";
  import UploadOptions from "@/common/UploadOptions.svelte";

  import { layout } from "@/manager/layout.js";
  import { orgsAndUsers } from "@/manager/orgsAndUsers.js";
  import { reprocessDocuments } from "@/manager/documents.js";
  import emitter from "@/emit.js";

  const emit = emitter({
    dismiss() {},
  });

  let forceOcr = false;
  let ocrEngine = "tess4";
  let language = layout.sameLanguage;

  async function reprocess(forceOcr, ocrEngine, language) {
    reprocessDocuments(
      layout.reprocessDocuments,
      forceOcr,
      ocrEngine,
      language,
    );
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
        <UploadOptions bind:language bind:forceOcr bind:ocrEngine />
      </p>

      <div class="buttonpadded">
        <Button on:click={() => reprocess(forceOcr, ocrEngine, language)}
          >{$_("dialogReprocessDialog.confirm")}</Button
        >
        <Button secondary={true} on:click={emit.dismiss}
          >{$_("dialog.cancel")}</Button
        >
      </div>
    </div>
  </div>
</Loader>
