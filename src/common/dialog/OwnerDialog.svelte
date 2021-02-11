<script>
  import Button from "@/common/Button";
  import Tooltip from "@/common/Tooltip";
  import { layout } from "@/manager/layout";
  import { layout as viewerLayout } from "@/viewer/layout";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";
  import { viewer } from "@/viewer/viewer";
  import { wrapLoad } from "@/util/wrapLoad";
  import { editMetadata } from "@/api/document";
  import {
    changeOwnerForDocuments,
    updateInCollection,
  } from "@/manager/documents";
  import { nameSingularNumberPlural } from "@/util/string";
  import emitter from "@/emit";

  const emit = emitter({
    dismiss() {},
  });

  let user = orgsAndUsers.me.id;
  let organization = orgsAndUsers.me.organization.id; // XXX get from selected docs
  let valid = true;
  let invalidReason = "Not implemented yet";

  $: isViewer = $viewer.document != null;
  $: numOwnerSelected = isViewer ? 1 : $layout.numOwnerSelected;

  async function ownerChange(user, organization) {
    if (!valid) return;
    if (isViewer) {
    } else {
      changeOwnerForDocuments(
        layout.ownerEditDocuments,
        user,
        organization,
        layout,
      );
    }
    emit.dismiss();
  }


</script>

<style lang="scss">
  input,
  table {
    position: border-box;
    width: 100%;
    font-size: 16px;
    font-family: inherit;
  }

  td:first-child {
    white-space: nowrap;
    padding-right: 5px;
  }

  td:last-child {
    width: 100%;
    position: relative;
  }
</style>


<div>
  <div class="mcontent">
    <h1>
      Change owner for
      {nameSingularNumberPlural(numOwnerSelected, "document")}
    </h1>
    <p>TK: Put scary warning here about losing access to your documents</p>
    <table>
      <tr>
        <td>User:</td>
        <td>
          <div>
            <input bind:value={user} />
          </div>
        </td>
      </tr>
      <tr>
        <td>Organization:</td>
        <td>
          <div>
            <input bind:value={organization} />
          </div>
        </td>
      </tr>
    </table>
    <div class="buttonpadded">
      {#if valid}
        <Button on:click={() => ownerChange(user, organization)}>Save</Button>
      {:else}
        <Tooltip caption={invalidReason} delay={500}>
          <Button disabled={true}>Save</Button>
        </Tooltip>
      {/if}
      <Button secondary={true} on:click={emit.dismiss}>Cancel</Button>
    </div>
  </div>
</div>
