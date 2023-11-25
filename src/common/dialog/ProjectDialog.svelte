<script>
  import Button from "@/common/Button.svelte";
  import Loader from "@/common/Loader.svelte";

  import { layout, showCollaborators, embedProject } from "@/manager/layout.js";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import emitter from "@/emit.js";
  import { textAreaResize } from "@/util/textareaResize.js";
  import { wrapLoadSeparate } from "@/util/wrapLoad.js";
  import {
    createNewProject,
    editProject,
    removeProject,
  } from "@/manager/projects";
  import { showConfirm } from "@/manager/confirmDialog.js";
  import { _ } from "svelte-i18n";

  const projectTitleLimit = import.meta.env.DC_PROJECT_TITLE_CHAR_LIMIT;
  const projectDescriptionLimit = import.meta.env
    .DC_PROJECT_DESCRIPTION_CHAR_LIMIT;

  const emit = emitter({
    dismiss() {},
  });

  let name = layout.projectEdit == null ? "" : layout.projectEdit.title;
  let description =
    layout.projectEdit == null ? "" : layout.projectEdit.description;
  let loading = writable(false);

  $: editing = $layout.projectEdit != null;

  $: normalizedName = name.trim();
  $: changed =
    !editing ||
    $layout.projectEdit.title != name ||
    $layout.projectEdit.description != description;
  $: valid = changed && normalizedName.length > 0;

  async function createOrUpdate() {
    if (!valid) return;

    if (editing) {
      await wrapLoadSeparate(loading, layout, async () => {
        await editProject(layout.projectEdit, normalizedName, description);
      });
    } else {
      await wrapLoadSeparate(loading, layout, async () => {
        await createNewProject(normalizedName, description);
      });
    }
    emit.dismiss();
  }

  async function remove() {
    showConfirm(
      "dialogProjectDialog.confirmDelete",
      "dialogProjectDialog.deleteProject",
      "dialog.delete",
      async () => {
        await wrapLoadSeparate(loading, layout, async () => {
          await removeProject(layout.projectEdit);
        });
        emit.dismiss();
      },
      { project: layout.projectEdit.title },
    );
  }

  let input;
  onMount(() => input.focus());
</script>

<style lang="scss">
  input {
    outline: none;
    width: 100%;
    padding: 4px 7px;
  }

  textarea {
    padding: 5px 7px;
  }

  p {
    margin-bottom: 0;
  }
</style>

<div>
  <Loader active={$loading}>
    <div class="mcontent">
      <h1>
        {#if editing}
          {$_("dialogProjectDialog.editProject")}
        {:else}
          {$_("dialogProjectDialog.createProject")}
        {/if}
      </h1>
      <div class="inputpadded">
        <input
          maxlength={projectTitleLimit}
          placeholder={$_("dialogProjectDialog.title")}
          bind:value={name}
          bind:this={input}
        />
        <p>
          <textarea
            maxlength={projectDescriptionLimit}
            placeholder={$_("dialogProjectDialog.projectDesc")}
            bind:value={description}
            use:textAreaResize
          />
        </p>
        {#if editing}
          <p>
            <Button nondescript={true} on:click={showCollaborators}>
              {$_("dialogProjectDialog.manageCollabs")}
            </Button><br />
            <Button nondescript={true} on:click={embedProject}>
              {$_("dialogProjectDialog.share")}
            </Button>
          </p>
        {/if}
      </div>
      <div class="buttonpadded">
        <Button
          disabledReason={valid
            ? null
            : changed
            ? $_("dialogProjectDialog.enterTitle")
            : $_("dialogProjectDialog.changeTitle")}
          on:click={() => createOrUpdate()}
        >
          {#if editing}
            {$_("dialog.update")}
          {:else}
            {$_("dialog.create")}
          {/if}
        </Button>
        {#if editing}
          <Button danger={true} on:click={() => remove()}>
            {$_("dialog.delete")}
          </Button>
        {/if}
        <Button secondary={true} on:click={emit.dismiss}>
          {$_("dialog.cancel")}
        </Button>
      </div>
    </div>
  </Loader>
</div>
