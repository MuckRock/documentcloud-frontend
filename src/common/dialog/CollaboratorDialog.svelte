<script>
  import Loader from "@/common/Loader";
  import Button from "@/common/Button";
  import Dropdown from "@/common/Dropdown";
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";

  import { wrapLoadSeparate } from "@/util/wrapLoad";
  import {
    layout,
    editProjectCollaboratorAccess,
    updateProjectEdit
  } from "@/manager/layout";
  import {
    getProjUsers,
    addUser,
    removeUserFromProject
  } from "@/manager/projects";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";
  import { showConfirm } from "@/manager/confirmDialog";
  import { titlecase } from "@/util/string";

  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import emitter from "@/emit";

  // SVG assets
  import pencilSvg from "@/assets/pencil.svg";

  const emit = emitter({
    dismiss() {}
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
      "Confirm remove user",
      `Proceeding will remove ${user.name} from ${layout.projectEdit.title}. Do you wish to continue?`,
      "Remove",
      async () => {
        await wrapLoadSeparate(
          loading,
          layout,
          async () => await removeUserFromProject(layout.projectEdit, user)
        );
        updateProjectEdit();
      }
    );
  }

  onMount(async () => {
    await wrapLoadSeparate(loading, layout, async () => {
      await getProjUsers(layout.projectEdit);
      updateProjectEdit();
    });
  });
</script>

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

<Loader active={$loading}>
  <div>
    <div class="mcontent">
      <div class="inputpadded">
        <h1>Add Collaborators</h1>
        <div class="collaborator">
          <div class="name">
            <input
              bind:value={email}
              placeholder="Email address"
              type="email" />
          </div>
          <span class="dropdown">
            <Dropdown
              table={true}
              bordered={true}
              horizPadding={15}
              vertPadding={8}>
              <span class="action" slot="title">
                {#if access == 'admin'}
                  Admin
                {:else if access == 'edit'}
                  Edit
                {:else if access == 'view'}View{/if}
                <span class="dropper">▼</span>
              </span>
              <Menu>
                <MenuItem on:click={() => (access = 'admin')}>
                  Admin
                  <div class="info">
                    Collaborators can edit this project and its documents
                  </div>
                </MenuItem>
                <MenuItem on:click={() => (access = 'edit')}>
                  Edit
                  <div class="info">
                    Collaborators can edit documents in this project
                  </div>
                </MenuItem>
                <MenuItem on:click={() => (access = 'view')}>
                  View
                  <div class="info">
                    Collaborators can view documents in this project
                  </div>
                </MenuItem>
              </Menu>
            </Dropdown>
          </span>
          <div class="button">
            <Button on:click={handleAdd}>+ Add</Button>
          </div>
        </div>
      </div>
      {#if $layout.projectEdit.usersAndAccesses.length == 0}
        {#if !$loading}
          <p class="fyi">
            You have not yet added any collaborators to this project. Invite
            collaborators to grant other users access to the documents shared in
            this project. You can control whether collaborators have access to
            view/edit the project’s documents or be an admin with permissions to
            invite other users and edit the project itself.
          </p>
        {/if}
      {:else}
        <h1>Manage Collaborators</h1>
        <div class="managetable">
          <div class="row header">
            <div>Name</div>
            <div>Access</div>
          </div>
          {#each $layout.projectEdit.usersAndAccesses as userAccess}
            <div class="row">
              <div class="name">
                {userAccess.user.name}
                {#if $orgsAndUsers.me != null && userAccess.user.id == $orgsAndUsers.me.id}
                  <i>(you)</i>
                {/if}
              </div>
              <div class="access">
                <span
                  class="pencil"
                  on:click={() => editProjectCollaboratorAccess(userAccess)}>
                  {@html pencilSvg}
                </span>
                {titlecase(userAccess.access)}
              </div>
              <div class="delete">
                <Button
                  on:click={() => removeProjectUser(userAccess.user)}
                  nondescript={true}
                  caution={true}>
                  Remove
                </Button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
      <div class="buttonpadded">
        <Button on:click={emit.dismiss}>Done</Button>
      </div>
    </div>
  </div>
</Loader>
