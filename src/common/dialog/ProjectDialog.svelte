<script>
  import Button from "@/common/Button";
  import Loader from "@/common/Loader";

  import { layout, showCollaborators, embedProject } from "@/manager/layout";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import emitter from "@/emit";
  import { textAreaResize } from "@/util/textareaResize";
  import { wrapLoadSeparate } from "@/util/wrapLoad";
  import {
    createNewProject,
    editProject,
    removeProject,
  } from "@/manager/projects";
  import { showConfirm } from "@/manager/confirmDialog";

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
      "Confirm delete",
      `Are you sure you want to delete this project (${layout.projectEdit.title})?`,
      "Delete",
      async () => {
        await wrapLoadSeparate(loading, layout, async () => {
          await removeProject(layout.projectEdit);
        });
        emit.dismiss();
      }
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

    .spanner {
      margin-left: 5px;
    }
  }
</style>

<div>
  <Loader active={$loading}>
    <div class="mcontent">
      <h1>
        {#if editing}Edit Project{:else}Create New Project{/if}
      </h1>
      <div class="inputpadded">
        <input placeholder="Title..." bind:value={name} bind:this={input} />
        <p>
          <textarea
            placeholder="Project Description (optional)"
            bind:value={description}
            use:textAreaResize />
        </p>
        {#if editing}
          <p>
            <Button nondescript={true} on:click={showCollaborators}>
              Manage Collaborators
            </Button>
            <!-- <span class="spanner">
              <Button nondescript={true} on:click={embedProject}>
                Share Project
              </Button>
            </span> -->
          </p>
        {/if}
      </div>
      <div class="buttonpadded">
        <Button
          disabledReason={valid ? null : changed ? 'Enter a title' : 'Change the title or description'}
          on:click={() => createOrUpdate()}>
          {#if editing}Update{:else}Create{/if}
        </Button>
        {#if editing}
          <Button danger={true} on:click={() => remove()}>Delete</Button>
        {/if}
        <Button secondary={true} on:click={emit.dismiss}>Cancel</Button>
      </div>
    </div>
  </Loader>
</div>
