<script>
  import Loader from "@/common/Loader.svelte";
  import Button from "@/common/Button.svelte";
  import Dropdown from "@/common/Dropdown.svelte";
  import Menu from "@/common/Menu.svelte";
  import MenuItem from "@/common/MenuItem.svelte";

  import { wrapLoadSeparate } from "@/util/wrapLoad.js";
  import {
    layout,
    editProjectCollaboratorAccess,
    updateProjectEdit,
  } from "@/manager/layout";
  import {
    getProjUsers,
    addUser,
    removeUserFromProject,
  } from "@/manager/projects";
  import { orgsAndUsers } from "@/manager/orgsAndUsers.js";
  import { showConfirm } from "@/manager/confirmDialog.js";
  import { titlecase } from "@/util/string.js";

  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import emitter from "@/emit.js";
  import { _ } from "svelte-i18n";

  // SVG assets
  import pencilSvg from "@/assets/pencil.svg?raw";

  const emit = emitter({
    dismiss() {},
  });

  let access = "admin";
  let email = "";
  let loading = writable(true);

  async function handleAdd() {
    await wrapLoadSeparate(loading, layout, async () => {
      await addUser(layout.projectEdit, email, access);
      updateProjectEdit();
    });
    email = "";
  }

  async function removeProjectUser(user) {
    showConfirm(
      "dialogCollaboratorDialog.confirm",
      "dialogCollaboratorDialog.confirmMsg",
      "dialog.remove",
      async () => {
        await wrapLoadSeparate(
          loading,
          layout,
          async () => await removeUserFromProject(layout.projectEdit, user),
        );
        updateProjectEdit();
      },
      { name: user.name, title: layout.projectEdit.title },
    );
  }

  onMount(async () => {
    await wrapLoadSeparate(loading, layout, async () => {
      await getProjUsers(layout.projectEdit);
      updateProjectEdit();
    });
  });

  $: oneAdmin =
    $layout.projectEdit.usersAndAccesses.filter((x) => x.access == "admin")
      .length == 1;
</script>

<Loader active={$loading}>
  <div>
    <div class="mcontent">
      <div class="inputpadded">
        <h1>{$_("dialogCollaboratorDialog.addCollaborators")}</h1>
        <p>
          {@html $_("dialogCollaboratorDialog.invite")}
        </p>
        <div class="collaborator">
          <div class="name">
            <input
              bind:value={email}
              placeholder={$_("common.emailAddress")}
              type="email"
            />
          </div>
          <span class="dropdown">
            <Dropdown
              table={true}
              bordered={true}
              horizPadding={15}
              vertPadding={8}
            >
              <span class="action" slot="title">
                {#if access == "admin"}
                  {$_("dialogCollaboratorDialog.admin")}
                {:else if access == "edit"}
                  {$_("dialog.edit")}
                {:else if access == "view"}
                  {$_("dialogCollaboratorDialog.view")}
                {/if}
                <span class="dropper">▼</span>
              </span>
              <Menu>
                <MenuItem on:click={() => (access = "admin")}>
                  {$_("dialogCollaboratorDialog.admin")}
                  <div class="info">
                    {$_("dialogCollaboratorDialog.adminHelp")}
                  </div>
                </MenuItem>
                <MenuItem on:click={() => (access = "edit")}>
                  {$_("dialog.edit")}
                  <div class="info">
                    {$_("dialogCollaboratorDialog.editHelp")}
                  </div>
                </MenuItem>
                <MenuItem on:click={() => (access = "view")}>
                  {$_("dialogCollaboratorDialog.view")}
                  <div class="info">
                    {$_("dialogCollaboratorDialog.viewHelp")}
                  </div>
                </MenuItem>
              </Menu>
            </Dropdown>
          </span>
          <div class="button">
            <Button on:click={handleAdd}
              >+ {$_("dialogCollaboratorDialog.add")}</Button
            >
          </div>
        </div>
      </div>
      {#if $layout.projectEdit.usersAndAccesses.length == 0}
        {#if !$loading}
          <p class="fyi">
            {$_("dialogCollaboratorDialog.empty")}
          </p>
        {/if}
      {:else}
        <h1>{$_("dialogCollaboratorDialog.manageCollaborators")}</h1>
        <div class="managetable">
          <div class="row header">
            <div>{$_("dialogCollaboratorDialog.name")}</div>
            <div>{$_("dialogCollaboratorDialog.access")}</div>
          </div>
          {#each $layout.projectEdit.usersAndAccesses as userAccess}
            <div class="row">
              <div class="name">
                {userAccess.user.name}
                {#if $orgsAndUsers.me != null && userAccess.user.id == $orgsAndUsers.me.id}
                  <i>{$_("dialogCollaboratorDialog.you")}</i>
                {/if}
              </div>
              <div class="access">
                {#if !oneAdmin || userAccess.access != "admin"}
                  <!-- Can't edit access on sole admin -->
                  <span
                    class="pencil"
                    on:click={() => editProjectCollaboratorAccess(userAccess)}
                  >
                    {@html pencilSvg}
                  </span>
                {/if}
                {titlecase(userAccess.access)}
              </div>
              {#if $orgsAndUsers.me == null || userAccess.user.id != $orgsAndUsers.me.id}
                <div class="delete">
                  <Button
                    on:click={() => removeProjectUser(userAccess.user)}
                    nondescript={true}
                    caution={true}
                  >
                    {$_("dialog.remove")}
                  </Button>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
      <div class="buttonpadded">
        <Button on:click={emit.dismiss}>{$_("dialog.done")}</Button>
      </div>
    </div>
  </div>
</Loader>

<style lang="scss">
  .collaborator {
    display: table;
    width: 100%;

    > * {
      display: table-cell;
      vertical-align: middle;
      height: 50px;
    }

    .name {
      input {
        width: 100%;
        box-sizing: border-box;
      }
    }

    .dropdown {
      padding: 0 15px 0 33px;
      width: 80px;
    }

    .button {
      width: 75px;
      text-align: center;
    }
  }

  .buttonpadded {
    margin-top: 50px;
  }

  .fyi {
    background: $fyi;
    padding: 1em;
    border-radius: 10px;
    color: $modal;
    line-height: 1.3;
    font-size: 14px;
  }

  .managetable {
    display: table;
    width: 100%;

    .row {
      display: table-row;

      > * {
        display: table-cell;
        vertical-align: middle;

        .pencil {
          @include buttonLike;
          vertical-align: middle;
        }
      }

      &.header {
        > * {
          font-weight: bold;
          font-size: 12px;
          text-transform: uppercase;
          color: $gray;
          padding: 3px 0 6px 0;
        }
      }
    }
  }
</style>
