<script>
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";

  // Stores
  import { layout, selectionProcessing } from "@/manager/layout";
  import { metaDialogs } from "@/common/dialog/metaDialogs";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";
  import {
    removeSelected,
    editMetaSelected,
    editDocumentInfoSelected,
    changeAccessSelected,
    changeOwnerSelected,
    editDataSelected,
    reprocessSelected,
    cancelProcessSelected,
    showDiagnosticsSelected,
  } from "@/manager/manager";
  import { nav } from "@/router/router";

  let processing = false;
  let allProcessing = false;
  let canChangeOwner = false;
  export let visible = false;

  $: {
    if (visible) {
      [processing, allProcessing] = selectionProcessing();
    }
  }

  $: {
    if (visible && $orgsAndUsers.me) {
      canChangeOwner =
        $layout.selected.filter(
          (doc) =>
            !(
              doc.userId == $orgsAndUsers.me.id &&
              (!doc.publicAccess ||
                $orgsAndUsers.me.organizations.indexOf(doc.orgId) >= 0)
            ),
        ).length == 0;
    }
  }

  function showEntities() {
    const docs = layout.selected;
    if (docs.length != 1) return;
    const doc = docs[0];
    nav("entity", { id: doc.slugId });
  }
</script>

<style lang="scss">
  .beta {
    color: $gray;
    font-size: 11px;
    vertical-align: top;
    letter-spacing: 0.4px;
    margin-left: 1px;
  }
</style>

<Menu>
  <MenuItem on:click={() => editDocumentInfoSelected()}>
    Edit Document Information
  </MenuItem>
  {#each metaDialogs as meta}
    <MenuItem
      indent={true}
      disabled={meta.disabled == null
        ? false
        : meta.disabled($layout.numSelected)}
      on:click={() => editMetaSelected(meta)}
    >
      {meta.menuTitle}
    </MenuItem>
  {/each}
  <MenuItem disabled={processing} on:click={changeAccessSelected}>
    Change Access
  </MenuItem>
  <MenuItem on:click={editDataSelected}>Edit Document Data</MenuItem>
  {#if allProcessing}
    <MenuItem danger={true} on:click={cancelProcessSelected}>
      Cancel Processing
    </MenuItem>
  {:else if !processing}
    <MenuItem on:click={reprocessSelected}>Force Reprocess</MenuItem>
  {/if}
  {#if $layout.numSelected == 1}
    <MenuItem on:click={showEntities}
      >Entities <span class="beta">BETA</span></MenuItem
    >
  {/if}
  {#if canChangeOwner}
    <MenuItem danger={true} on:click={changeOwnerSelected}>
      Change Owner
    </MenuItem>
  {/if}
  <MenuItem danger={true} on:click={removeSelected}>Delete</MenuItem>
  {#if $orgsAndUsers.isStaff}
    <MenuItem special={true} on:click={showDiagnosticsSelected}>
      Diagnostic Info
    </MenuItem>
  {/if}
</Menu>
