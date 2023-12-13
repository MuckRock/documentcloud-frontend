import Empty from "@/pages/home/Empty.svelte"; // explicit extension for tests
import { Svue } from "svue";

export const viewerEditDialogs = new Svue({
  data() {
    return {
      embedDialog: Empty,
      accessDialog: Empty,
      documentInformationDialog: Empty,
      dataDialog: Empty,
      editSectionsDialog: Empty,
      documentPickerDialog: Empty,
      revisionsDialog: Empty,
      loaded: false,
    };
  },
});

export async function loadViewerEditDialogs() {
  if (viewerEditDialogs.loaded) return;
  viewerEditDialogs.loaded = true;
  const dialogs = await Promise.all([
    import("@/common/dialog/EmbedDialog.svelte"),
    import("@/common/dialog/AccessDialog.svelte"),
    import("@/common/dialog/DocumentInformationDialog.svelte"),
    import("@/common/dialog/DataDialog.svelte"),
    import("@/common/dialog/EditSectionsDialog.svelte"),
    import("@/common/dialog/DocumentPickerDialog.svelte"),
    import("@/common/dialog/RevisionsDialogContainer.svelte"),
  ]);
  viewerEditDialogs.embedDialog = dialogs[0].default;
  viewerEditDialogs.accessDialog = dialogs[1].default;
  viewerEditDialogs.documentInformationDialog = dialogs[2].default;
  viewerEditDialogs.dataDialog = dialogs[3].default;
  viewerEditDialogs.editSectionsDialog = dialogs[4].default;
  viewerEditDialogs.documentPickerDialog = dialogs[5].default;
  viewerEditDialogs.revisionsDialog = dialogs[6].default;
}
