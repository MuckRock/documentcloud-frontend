<script>
  import { _ } from "svelte-i18n";

  import Button from "@/common/Button.svelte";
  import DocumentThumbnail from "@/pages/app/DocumentThumbnail.svelte";

  import { STAFF_ONLY_S3_URL } from "../../config/config.js";
  import emitter from "@/emit.js";
  import { layout } from "@/manager/layout.js";
  import { apiUrl } from "@/api/base.js";

  const emit = emitter({
    dismiss() {},
  });

  $: documents = $layout.selected;
</script>

<div>
  <div class="mcontent">
    <h1>
      {$_("dialogDiagnosticDialog.staffOnlyInfo", {
        values: { n: documents.length },
      })}
    </h1>
    <div class="inputpadded">
      <table>
        <tr>
          <th />
          <th>{$_("dialogDiagnosticDialog.id")}</th>
          <th>{$_("dialogDiagnosticDialog.title")}</th>
          <th>{$_("dialogDiagnosticDialog.actions")}</th>
          <th>{$_("dialogDiagnosticDialog.debug")}</th>
        </tr>
        {#each documents as document}
          <tr>
            <td>
              <DocumentThumbnail {document} />
            </td>
            <td>{document.id}</td>
            <td>{document.title}</td>
            <td>
              <a
                target="_blank"
                href={apiUrl(`documents/${document.id}/errors/`)}
              >
                <Button small={true}
                  >{$_("dialogDiagnosticDialog.viewErrors")}</Button
                >
              </a>
              <a
                target="_blank"
                rel="noopener noreferer"
                href={STAFF_ONLY_S3_URL.replace("$$ID$$", document.id)}
              >
                <Button small={true}
                  >{$_("dialogDiagnosticDialog.viewS3")}</Button
                >
              </a>
            </td>
            <td>{JSON.stringify(document.doc)}</td>
          </tr>
        {/each}
      </table>
    </div>
    <div class="buttonpadded">
      <Button on:click={emit.dismiss}>{$_("dialog.done")}</Button>
    </div>
  </div>
</div>

<style lang="scss">
  $border: solid 1px gainsboro;
  table {
    border-spacing: 0;

    td,
    th {
      border: none;
      border-right: $border;
      border-bottom: $border;
      padding: 5px;

      &:first-child {
        border-left: $border;
      }
    }

    tr:first-child {
      td,
      th {
        border-top: $border;
      }
    }
  }
</style>
