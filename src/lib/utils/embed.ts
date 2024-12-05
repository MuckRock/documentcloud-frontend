export interface EmbedSettingOption {
  label: string;
  help: string;
  value: null | number;
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
  defaultValue: null | number;
  field: ToggleField | DimensionField | HiddenField;
}

export let settings = {
  // responsive: null,
  width: null,
  height: null,
  sidebar: null,
  title: null,
  pdf: null,
  text: null,
  fullscreen: null,
  onlyshoworg: null,
};

export type EmbedSettings = Record<keyof typeof settings, null | number>;

export const defaultSettings: EmbedSettings = {
  // responsive: 1,
  width: null,
  height: null,
  sidebar: null,
  title: 1,
  pdf: 0,
  text: null,
  fullscreen: 1,
  onlyshoworg: 0,
};

export function createEmbedSearchParams(
  params: Partial<EmbedSettings>,
): URLSearchParams {
  let searchParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === null) return;
    searchParams[key] = String(value);
  });
  return new URLSearchParams(searchParams);
}

export function getEmbedSettings(searchParams: URLSearchParams): EmbedSettings {
  const embedSettings = Object.assign({}, defaultSettings);
  Object.keys(embedSettings).forEach((key) => {
    if (searchParams.has(key)) {
      embedSettings[key] = truthy(searchParams.get(key));
    }
  });
  return embedSettings;
}

export function truthy(
  value: string | number | boolean | null | undefined,
): boolean | number {
  if (value === undefined) return false;
  if (value === null) return false;

  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    try {
      const jsonValue = JSON.parse(value);
      if (typeof jsonValue === "boolean") return jsonValue;
      if (typeof jsonValue === "number") return jsonValue;
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export const settingsConfig: Record<keyof EmbedSettings, EmbedSettingConfig> = {
  /*   responsive: {
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
 */
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

/**
 * Is this URL an embed or a regular view
 *
 * @param url
 */
export function isEmbed(url: URL): Boolean {
  return (
    url.searchParams.has("embed") || url.hostname === "embed.documentcloud.org"
  );
}

/**
 * @type {import('@sveltejs/kit').Reroute}
 *
 * Point embedded routes to the proper component
 */
export function reroute({ url }) {
  // you can still go to embed routes directly
  if (url.pathname.startsWith("/embed/")) return url.pathname;

  // this lets us use the same viewer URL with different components
  // depending on whether we're embedded or not
  if (isEmbed(url)) {
    return "/embed" + url.pathname;
  }
}

export function timeoutify(fn, timeout = 100) {
  let timer: null | ReturnType<typeof setTimeout> = null;

  return (...args) => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }

    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, timeout);
  };
}

export function informSize(
  element: HTMLElement,
  useScrollDimension = true,
  updateStyleProps = false,
) {
  if (!element) return;

  // Inform a parent window about an embed size
  const update = () => {
    window.parent.postMessage(
      {
        width: Math.max(
          useScrollDimension ? element.scrollWidth : 0,
          element.offsetWidth,
        ),
        height: Math.max(
          useScrollDimension ? element.scrollHeight : 0,
          element.offsetHeight,
        ),
        updateStyleProps,
      },
      "*",
    );
  };

  // Trigger event now and any time the window resizes
  window.addEventListener("resize", timeoutify(update));
  update();
}
