import Empty from '@/pages/home/Empty.svelte';  // explicit extension for tests
import { Svue } from 'svue';

export const viewerEditDialogs = new Svue({
  data() {
    return {
      embedDialog: Empty,
      accessDialog: Empty,
      documentInformationDialog: Empty,
      dataDialog: Empty,
      editSectionsDialog: Empty,
      loaded: false,
    }
  }
});

export async function loadViewerEditDialogs() {
  if (viewerEditDialogs.loaded) return;
  viewerEditDialogs.loaded = true;
  const dialogs = await Promise.all([
    import("@/common/dialog/EmbedDialog"),
    import("@/common/dialog/AccessDialog"),
    import("@/common/dialog/DocumentInformationDialog"),
    import("@/common/dialog/DataDialog"),
    import("@/common/dialog/EditSectionsDialog"),
  ]);
  viewerEditDialogs.embedDialog = dialogs[0].default;
  viewerEditDialogs.accessDialog = dialogs[1].default;
  viewerEditDialogs.documentInformationDialog = dialogs[2].default;
  viewerEditDialogs.dataDialog = dialogs[3].default;
  viewerEditDialogs.editSectionsDialog = dialogs[4].default;
}
