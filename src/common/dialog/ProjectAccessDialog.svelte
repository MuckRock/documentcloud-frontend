<script>
  import { _ } from "svelte-i18n";
  import { writable } from "svelte/store";

  import Button from "@/common/Button.svelte";
  import Loader from "@/common/Loader.svelte";

  import { layout, updateProjectEdit } from "@/manager/layout.js";
  import { changeUserAccess } from "@/manager/projects.js";
  import { wrapLoadSeparate } from "@/util/wrapLoad.js";
  import emitter from "@/emit.js";

  const emit = emitter({
    dismiss() {},
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
        access,
      );
      updateProjectEdit();
    });
    emit.dismiss();
  }
</script>

<Loader active={$loading}>
  <div>
    <div class="mcontent">
      <h1>
        {$_("dialogProjectAccessDialog.changeAccessFor", {
          values: { name: $layout.projectEditUser.user.name },
        })}
      </h1>
      <p>
        {$_("dialogProjectAccessDialog.selectAccess", {
          values: {
            name: $layout.projectEditUser.user.name,
            title: $layout.projectEdit.title,
          },
        })}
      </p>
      <div class="inputpadded">
        <label>
          <input type="radio" bind:group={access} value={"admin"} />
          <div class="accessoption">
            <h3>{$_("dialogProjectAccessDialog.adminAccess")}</h3>
            <small>
              {$_("dialogProjectAccessDialog.adminHelp")}
            </small>
          </div>
        </label>
        <label>
          <input type="radio" bind:group={access} value={"edit"} />
          <div class="accessoption">
            <h3>{$_("dialogProjectAccessDialog.editAccess")}</h3>
            <small>
              {$_("dialogProjectAccessDialog.editHelp")}
            </small>
          </div>
        </label>
        <label>
          <input type="radio" bind:group={access} value={"view"} />
          <div class="accessoption">
            <h3>{$_("dialogProjectAccessDialog.viewAccess")}</h3>
            <small>
              {$_("dialogProjectAccessDialog.viewHelp")}
            </small>
          </div>
        </label>
      </div>
      <div class="buttonpadded">
        <Button
          disabledReason={valid
            ? null
            : $_("dialogProjectAccessDialog.invalidAccess", {
                values: { access: $layout.projectEditUser.access },
              })}
          on:click={() => changeAccess(access)}
        >
          {$_("dialogProjectAccessDialog.changeAccess")}
        </Button>
        <Button secondary={true} on:click={emit.dismiss}
          >{$_("dialog.cancel")}</Button
        >
      </div>
    </div>
  </div>
</Loader>

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
