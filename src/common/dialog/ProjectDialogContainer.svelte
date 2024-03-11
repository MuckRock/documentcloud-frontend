<script lang="ts">
  import { writable } from "svelte/store";
  import emitter from "../../emit.js";
  import { wrapLoadSeparate } from "../../util/wrapLoad.js";
  import { lastUpdated } from "../../projects/Browser.svelte";
  import {
    createNewProject,
    editProject,
    removeProject,
  } from "../../manager/projects";
  import {
    layout,
    showCollaborators,
    embedProject,
  } from "../../manager/layout.js";
  import { showConfirm } from "../../manager/confirmDialog.js";
  import ProjectDialog, { type FormData } from "./ProjectDialog.svelte";

  const emit = emitter({
    dismiss() {},
  });

  let loading = writable(false);

  async function upsertProject(data: FormData, isValid: boolean) {
    if (!isValid) return;

    if (editing) {
      await wrapLoadSeparate(loading, layout, async () => {
        await editProject(
          layout.projectEdit,
          data.name,
          data.description,
          data.private,
        );
      });
    } else {
      await wrapLoadSeparate(loading, layout, async () => {
        await createNewProject(data.name, data.description, data.private);
      });
    }
    $lastUpdated = new Date();
    emit.dismiss();
  }

  async function deleteProject() {
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

  function cancel() {
    emit.dismiss();
  }

  $: editing = $layout.projectEdit != null;

  $: initialData = {
    name: $layout.projectEdit?.title ?? "",
    description: $layout.projectEdit?.description ?? "",
    private: $layout.projectEdit?.private ?? false,
  };
</script>

<ProjectDialog
  loading={$loading}
  {editing}
  {initialData}
  {showCollaborators}
  {embedProject}
  onSave={upsertProject}
  onDelete={deleteProject}
  onCancel={cancel}
/>
