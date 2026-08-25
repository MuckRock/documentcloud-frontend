import type { EmbedSettingConfig } from "$lib/utils/embed";

export let settings = {
  title: null,
};

export type ProjectEmbedSettings = Record<keyof typeof settings, null | number>;

export const settingsConfig: Record<string, EmbedSettingConfig> = {
  title: {
    storageIndex: 1,
    defaultValue: 1,
    field: {
      type: "toggle",
      label: "projectEmbedDialog.titleBehavior",
      options: [
        {
          label: "projectEmbedDialog.visibleDefault",
          help: "projectEmbedDialog.tVisibleHelp",
          value: 1,
        },
        {
          label: "projectEmbedDialog.hidden",
          help: "projectEmbedDialog.tHiddenHelp",
          value: 0,
        },
      ],
    },
  },
};
