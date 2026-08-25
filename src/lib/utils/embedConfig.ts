import { type EmbedConfig, getConfigDefaults } from "./embed";

export const documentSettings = {
  title: {
    defaultValue: 1,
    field: {
      type: "toggle",
      label: "dialogDocumentEmbedDialog.titleBehavior",
      options: [
        {
          label: "dialogDocumentEmbedDialog.visibleDefault",
          help: "dialogDocumentEmbedDialog.tVisibleHelp",
          value: 1,
        },
        {
          label: "dialogDocumentEmbedDialog.hidden",
          help: "dialogDocumentEmbedDialog.tHiddenHelp",
          value: 0,
        },
      ],
    },
  },
  pdf: {
    defaultValue: 1,
    field: {
      type: "toggle",
      label: "dialogDocumentEmbedDialog.pdfLink",
      options: [
        {
          label: "dialogDocumentEmbedDialog.visibleDefault",
          help: "dialogDocumentEmbedDialog.plVisibleHelp",
          value: 1,
        },
        {
          label: "dialogDocumentEmbedDialog.hidden",
          help: "dialogDocumentEmbedDialog.plHiddenHelp",
          value: 0,
        },
      ],
    },
  },
  fullscreen: {
    defaultValue: 1,
    field: {
      type: "toggle",
      label: "dialogDocumentEmbedDialog.fullscreenOption",
      options: [
        {
          label: "dialogDocumentEmbedDialog.visibleDefault",
          help: "dialogDocumentEmbedDialog.fsVisibleHelp",
          value: 1,
        },
        {
          label: "dialogDocumentEmbedDialog.hidden",
          help: "dialogDocumentEmbedDialog.fsHiddenHelp",
          value: 0,
        },
      ],
    },
  },
  onlyshoworg: {
    defaultValue: 0,
    field: {
      type: "toggle",
      label: "dialogDocumentEmbedDialog.contributedByFormat",
      options: [
        {
          label: "dialogDocumentEmbedDialog.cbfUserAndOrg",
          help: "dialogDocumentEmbedDialog.cbfUserAndOrgHelp",
          value: 0,
        },
        {
          label: "dialogDocumentEmbedDialog.cbfOrgOnly",
          help: "dialogDocumentEmbedDialog.cbfOrgOnlyHelp",
          value: 1,
        },
      ],
    },
  },
} satisfies EmbedConfig;

export const documentDefaults = getConfigDefaults(documentSettings);

export type DocumentSettings = Partial<typeof documentDefaults>;

export const projectSettings = {
  title: {
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
  description: {
    defaultValue: 1,
    field: {
      type: "toggle",
      label: "projectEmbedDialog.descriptionBehavior",
      options: [
        {
          label: "projectEmbedDialog.visibleDefault",
          help: "projectEmbedDialog.dVisibleHelp",
          value: 1,
        },
        {
          label: "projectEmbedDialog.hidden",
          help: "projectEmbedDialog.dHiddenHelp",
          value: 0,
        },
      ],
    },
  },
} satisfies EmbedConfig;

export const projectDefaults = getConfigDefaults(projectSettings);

export type ProjectSettings = Partial<typeof projectDefaults>;
