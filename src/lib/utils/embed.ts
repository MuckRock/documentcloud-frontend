export interface EmbedSettingOption {
  label: string;
  help: string;
  value: number;
}

export interface HiddenField {
  type: "hidden";
}

export interface ToggleField {
  type: "toggle";
  label: string;
  options: EmbedSettingOption[];
}

export interface DimensionField {
  type: "dimension";
  label: string;
  automatic: EmbedSettingOption;
  fixed: EmbedSettingOption;
}

export interface EmbedSettingConfig {
  storageIndex: number;
  defaultValue: number;
  field: ToggleField | DimensionField | HiddenField;
}

export let settings = {
  embed: 1,
  responsive: null,
  width: null,
  height: null,
  sidebar: null,
  title: null,
  pdf: null,
  text: null,
  fullscreen: null,
  onlyshoworg: null,
};

export function createEmbedSearchParams(
  params: Partial<typeof settings>,
): URLSearchParams {
  let searchParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === null) return;
    searchParams[key] = String(value);
  });
  return new URLSearchParams(searchParams);
}

export const settingsConfig: Record<keyof typeof settings, EmbedSettingConfig> =
  {
    embed: {
      storageIndex: null,
      defaultValue: 1,
      field: {
        type: "hidden",
      },
    },
    responsive: {
      storageIndex: 8, // out-of-order because added later
      defaultValue: 1,
      field: {
        type: "toggle",
        label: "dialogDocumentEmbedDialog.responsive",
        options: [
          {
            label: "dialogDocumentEmbedDialog.respOn",
            help: "dialogDocumentEmbedDialog.respOnHelp",
            value: 1,
          },
          {
            label: "dialogDocumentEmbedDialog.respOff",
            help: "dialogDocumentEmbedDialog.respOffHelp",
            value: 0,
          },
        ],
      },
    },
    width: {
      storageIndex: 1,
      defaultValue: null,
      field: {
        type: "dimension",
        label: "dialogDocumentEmbedDialog.width",
        automatic: {
          label: "appearanceDimension.responsive",
          help: "dialogDocumentEmbedDialog.widthAuto",
          value: null,
        },
        fixed: {
          label: "appearanceDimension.fixed",
          help: "dialogDocumentEmbedDialog.widthFixed",
          value: 500,
        },
      },
    },
    height: {
      storageIndex: 2,
      defaultValue: null,
      field: {
        type: "dimension",
        label: "dialogDocumentEmbedDialog.height",
        automatic: {
          label: "appearanceDimension.responsive",
          help: "dialogDocumentEmbedDialog.heightAuto",
          value: null,
        },
        fixed: {
          label: "appearanceDimension.fixed",
          help: "dialogDocumentEmbedDialog.widthFixed",
          value: 500,
        },
      },
    },
    sidebar: {
      storageIndex: 0,
      defaultValue: null,
      field: {
        type: "toggle",
        label: "dialogDocumentEmbedDialog.sidebarBehavior",
        options: [
          {
            label: "dialogDocumentEmbedDialog.sbResponsive",
            help: "dialogDocumentEmbedDialog.sbResponsiveHelp",
            value: null,
          },
          {
            label: "dialogDocumentEmbedDialog.hidden",
            help: "dialogDocumentEmbedDialog.sbHiddenHelp",
            value: 0,
          },
          {
            label: "dialogDocumentEmbedDialog.visible",
            help: "dialogDocumentEmbedDialog.sbVisibleHelp",
            value: 1,
          },
        ],
      },
    },
    title: {
      storageIndex: 3,
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
      storageIndex: 4,
      defaultValue: null,
      field: {
        type: "toggle",
        label: "dialogDocumentEmbedDialog.pdfLink",
        options: [
          {
            label: "dialogDocumentEmbedDialog.visibleDefault",
            help: "dialogDocumentEmbedDialog.plVisibleHelp",
            value: null,
          },
          {
            label: "dialogDocumentEmbedDialog.hidden",
            help: "dialogDocumentEmbedDialog.plHiddenHelp",
            value: 0,
          },
        ],
      },
    },
    text: {
      storageIndex: 6,
      defaultValue: null,
      field: {
        type: "toggle",
        label: "dialogDocumentEmbedDialog.textMode",
        options: [
          {
            label: "dialogDocumentEmbedDialog.visibleDefault",
            help: "dialogDocumentEmbedDialog.tmVisibleHelp",
            value: null,
          },
          {
            label: "dialogDocumentEmbedDialog.hidden",
            help: "dialogDocumentEmbedDialog.tmHiddenHelp",
            value: 0,
          },
        ],
      },
    },
    fullscreen: {
      storageIndex: 5,
      defaultValue: null,
      field: {
        type: "toggle",
        label: "dialogDocumentEmbedDialog.fullscreenOption",
        options: [
          {
            label: "dialogDocumentEmbedDialog.visibleDefault",
            help: "dialogDocumentEmbedDialog.fsVisibleHelp",
            value: null,
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
      storageIndex: 7,
      defaultValue: null,
      field: {
        type: "toggle",
        label: "dialogDocumentEmbedDialog.contributedByFormat",
        options: [
          {
            label: "dialogDocumentEmbedDialog.cbfUserAndOrg",
            help: "dialogDocumentEmbedDialog.cbfUserAndOrgHelp",
            value: null,
          },
          {
            label: "dialogDocumentEmbedDialog.cbfOrgOnly",
            help: "dialogDocumentEmbedDialog.cbfOrgOnlyHelp",
            value: 1,
          },
        ],
      },
    },
  };
