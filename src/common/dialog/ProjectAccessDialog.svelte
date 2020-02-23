<script>
  import Loader from "@/common/Loader";
  import Button from "@/common/Button";
  import Tooltip from "@/common/Tooltip";
  import { layout, updateProjectEdit } from "@/manager/layout";
  import { changeUserAccess } from "@/manager/projects";
  import { wrapLoadSeparate } from "@/util/wrapLoad";
  import { writable } from "svelte/store";
  import emitter from "@/emit";

  const emit = emitter({
    dismiss() {}
  });

  let access = layout.projectEditUser.access;
  let loading = writable(false);

  $: valid = access != $layout.projectEditUser.access;

  async function changeAccess(access) {
    if (!valid) return;
    // Change user access in project
    await wrapLoadSeparate(loading, layout, async () => {
      await changeUserAccess(
        layout.projectEdit,
        layout.projectEditUser.user,
        access
      );
      updateProjectEdit();
    });
    emit.dismiss();
  }
</script>

<style lang="scss">
  label {
    display: table;
    margin: 12px 0;
  }

  input {
    display: table-cell;
  }

  p {
    margin: 0 0 10px 0;
  }

  .accessoption {
    display: table-cell;
    padding-left: 10px;
  }

  h3 {
    font-size: 16px;
    margin: 0;
  }

  small {
    margin: 5px 0;
  }
</style>

<Loader active={$loading}>
  <div>
    <div class="mcontent">
      <h1>Change access for {$layout.projectEditUser.user.name}</h1>
      <p>
        Select an access level below for {$layout.projectEditUser.user.name} in {$layout.projectEdit.title}
      </p>
      <div class="inputpadded">
        <label>
          <input type="radio" bind:group={access} value={'admin'} />
          <div class="accessoption">
            <h3>Admin Access</h3>
            <small>
              This collaborator can edit this project and its documents. The
              collaborator can invite users, delete users, and remove the
              project.
            </small>
          </div>
        </label>
        <label>
          <input type="radio" bind:group={access} value={'edit'} />
          <div class="accessoption">
            <h3>Edit Access</h3>
            <small>
              This collaborator can edit documents in this project but cannot
              edit the project itself.
            </small>
          </div>
        </label>
        <label>
          <input type="radio" bind:group={access} value={'view'} />
          <div class="accessoption">
            <h3>View Access</h3>
            <small>
              This collaborator can view documents in this project but cannot
              edit them or the project.
            </small>
          </div>
        </label>
      </div>
      <div class="buttonpadded">
        <Button
          disabledReason={valid ? null : `Access is already set to ${$layout.projectEditUser.access}. Select a different access level.`}
          on:click={() => changeAccess(access)}>
          Change access
        </Button>
        <Button secondary={true} on:click={emit.dismiss}>Cancel</Button>
      </div>
    </div>
  </div>
</Loader>
