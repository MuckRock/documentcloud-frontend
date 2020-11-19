<script>
  import Button from "@/common/Button";
  import emitter from "@/emit";
  import { layout } from "@/manager/layout";
  import { nameSingularNumberPlural } from "@/util/string";
  import DocumentThumbnail from "@/pages/app/DocumentThumbnail";
  import { apiUrl } from "@/api/base";

  const emit = emitter({
    dismiss() {},
  });

  $: documents = $layout.selected;
</script>

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

<div>
  <div class="mcontent">
    <h1>
      Staff-only info for selected
      {nameSingularNumberPlural(documents.length, 'document')}
    </h1>
    <div class="inputpadded">
      <table>
        <tr>
          <th />
          <th>ID</th>
          <th>Title</th>
          <th>Actions</th>
          <th>Debug</th>
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
                href={apiUrl(`documents/${document.id}/errors/`)}>
                <Button small={true}>View errors</Button>
              </a>
              <a
                target="_blank"
                href={process.env.STAFF_ONLY_S3_URL.replace('$$ID$$', document.id)}>
                <Button small={true}>View in S3</Button>
              </a>
            </td>
            <td>{JSON.stringify(document.doc)}</td>
          </tr>
        {/each}
      </table>
    </div>
    <div class="buttonpadded">
      <Button on:click={emit.dismiss}>Done</Button>
    </div>
  </div>
</div>
