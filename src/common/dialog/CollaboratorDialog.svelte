<script>
  import Button from "@/common/Button";
  import Dropdown from "@/common/Dropdown";
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";

  import { layout } from "@/manager/layout";
  import { getProjectUsers, addUser } from "@/manager/projects";

  import emitter from "@/emit";

  const emit = emitter({
    dismiss() {}
  });

  let access = "admin";
  let email = "";

  async function handleAdd() {
    await addUser(layout.projectEdit, email, access);
  }

  getProjectUsers(layout.projectEdit); // log users
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
    background: #fbf9f3;
    padding: 1em;
    border-radius: 10px;
    color: $modal;
    line-height: 1.3;
    font-size: 14px;
  }
</style>

<div>
  <div class="mcontent">
    <h1>Manage Collaborators</h1>
    <div class="inputpadded">
      <h1>Add Collaborators</h1>
      <div class="collaborator">
        <div class="name">
          <input bind:value={email} placeholder="Email address" type="email" />
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
    <p class="fyi">
      You have not yet added any collaborators to this project. Invite
      collaborators to grant other users access to the documents shared in this
      project. You can control whether collaborators have access to view/edit
      the project’s documents or be an admin with permissions to invite other
      users and edit the project itself.
    </p>
    <div class="buttonpadded">
      <Button on:click={emit.dismiss}>Done</Button>
    </div>
  </div>
</div>
