<script>
  import Button from "@/common/Button";
  import Loader from "@/common/Loader";

  import { layout } from "@/manager/layout";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import emitter from "@/emit";
  import { textAreaResize } from "@/util/textareaResize";
  import { wrapLoadSeparate } from "@/util/wrapLoad";
  import {
    createNewProject,
    editProject,
    removeProject
  } from "@/manager/projects";
  import { showConfirm } from "@/manager/confirmDialog";

  const emit = emitter({
    dismiss() {}
  });

  let name = layout.projectEdit == null ? "" : layout.projectEdit.title;
  let description =
    layout.projectEdit == null ? "" : layout.projectEdit.description;
  let loading = writable(false);

  $: editing = $layout.projectEdit != null;

  $: normalizedName = name.trim();
  $: changed =
    !editing ||
    ($layout.projectEdit.title != name ||
      $layout.projectEdit.description != description);
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
      "Are you sure you want to delete the specified project?",
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
  }

  p {
    margin-bottom: 0;
  }
</style>

<div>
  <div class="mcontent">
    <h1>Create new project</h1>
    <div class="inputpadded">
      <input placeholder="Title..." bind:value={name} bind:this={input} />
      <p>
        <textarea
          placeholder="Project Description (optional)"
          bind:value={description}
          use:textAreaResize />
      </p>
    </div>
    <div class="buttonpadded">
      {#if editing}
        <Button danger={true} on:click={remove}>Delete</Button>
      {/if}
      <Button
        disabledReason={valid ? null : changed ? 'Enter a title' : 'Change the title or description'}
        on:click={createOrUpdate}>
        {#if editing}Update{:else}Create{/if}
      </Button>
      <Button secondary={true} on:click={emit.dismiss}>Cancel</Button>
    </div>
  </div>
</div>
