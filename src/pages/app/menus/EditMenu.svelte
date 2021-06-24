<script>
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";
  import { _ } from "svelte-i18n";

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
  :global(.beta) {
    color: $gray;
    font-size: 11px;
    vertical-align: top;
    letter-spacing: 0.4px;
    margin-left: 1px;
  }
</style>

<Menu>
  <MenuItem on:click={() => editDocumentInfoSelected()}>
    {$_("editMenu.editDocInfo")}
  </MenuItem>
  {#each metaDialogs as meta}
    <MenuItem
      indent={true}
      disabled={meta.disabled == null
        ? false
        : meta.disabled($layout.numSelected)}
      on:click={() => editMetaSelected(meta)}
    >
      {$_(meta.menuTitle)}
    </MenuItem>
  {/each}
  <MenuItem disabled={processing} on:click={changeAccessSelected}>
    {$_("editMenu.changeAccess")}
  </MenuItem>
  <MenuItem on:click={editDataSelected}>{$_("editMenu.editDocData")}</MenuItem>
  {#if allProcessing}
    <MenuItem danger={true} on:click={cancelProcessSelected}>
      {$_("editMenu.cancelProcessing")}
    </MenuItem>
  {:else if !processing}
    <MenuItem on:click={reprocessSelected}>
      {$_("editMenu.forceReprocess")}
    </MenuItem>
  {/if}
  {#if $layout.numSelected == 1}
    <MenuItem on:click={showEntities}>
      {@html $_("editMenu.entities")}
    </MenuItem>
  {/if}
  {#if canChangeOwner}
    <MenuItem danger={true} on:click={changeOwnerSelected}>
      {$_("editMenu.changeOwner")}
    </MenuItem>
  {/if}
  <MenuItem danger={true} on:click={removeSelected}>
    {$_("editMenu.delete")}
  </MenuItem>
  {#if $orgsAndUsers.isStaff}
    <MenuItem special={true} on:click={showDiagnosticsSelected}>
      {$_("editMenu.diagnosticInfo")}
    </MenuItem>
  {/if}
</Menu>
