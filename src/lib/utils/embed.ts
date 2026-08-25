import type { Reroute } from "@sveltejs/kit";

interface EmbedSettingOption {
  label: string;
  help: string;
  value: null | number;
}

interface HiddenField {
  type: "hidden";
}

interface ToggleField {
  type: "toggle";
  label: string;
  options: EmbedSettingOption[];
}

interface DimensionField {
  type: "dimension";
  label: string;
  automatic?: EmbedSettingOption;
  fixed: EmbedSettingOption;
}

type DefaultValue = number | null;

export interface EmbedSettingConfig {
  defaultValue: DefaultValue;
  field: ToggleField | DimensionField | HiddenField;
}

type EmbedConfigDefaults<T> = {
  [K in keyof T]: DefaultValue;
} & {};

export type EmbedConfig = Record<string, EmbedSettingConfig>;

export function createEmbedSearchParams<T>(
  params: Record<string, DefaultValue>,
  defaultSettings: EmbedConfigDefaults<T>,
): URLSearchParams {
  let searchParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === defaultSettings[key]) return;
    searchParams[key] = String(value);
  });
  return new URLSearchParams(searchParams);
}

export function getEmbedSettings<T>(
  searchParams: URLSearchParams,
  defaultSettings: EmbedConfigDefaults<T>,
) {
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

/**
 * Extract default values from a config object to initialize a store
 */
export function getConfigDefaults<T extends EmbedConfig>(
  config: T,
): EmbedConfigDefaults<T> {
  return Object.fromEntries(
    Object.entries(config).map(([key, { defaultValue }]) => [
      key,
      defaultValue,
    ]),
  ) as EmbedConfigDefaults<T>;
}

/**
 * Is this URL an embed or a regular view
 *
 * @param url
 */
export function isEmbed(url: URL): Boolean {
  if (!url.pathname.match(/^\/(documents|projects)/)) return false;
  return (
    url.searchParams.has("embed") || url.hostname === "embed.documentcloud.org"
  );
}

/**
 * Point embedded routes to the proper component
 */
export const reroute: Reroute = ({ url }) => {
  // you can still go to embed routes directly
  if (url.pathname.startsWith("/embed/")) return url.pathname;

  // this lets us use the same viewer URL with different components
  // depending on whether we're embedded or not
  if (isEmbed(url)) {
    return "/embed" + url.pathname;
  }
};

export function timeoutify(fn: Function, timeout = 100) {
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

/**
 * Use postMessage to inform parent windows of the size of an embedded iframe.
 * Set timeout: number to send a new message on each resize event, buffered by a timer.
 */
export function informSize({
  element,
  useScrollDimension = true,
  updateStyleProps = false,
  timeout = 500,
  debug = false,
}: {
  element: HTMLElement;
  useScrollDimension?: boolean;
  updateStyleProps?: boolean;
  timeout?: number | false;
  debug?: boolean;
}) {
  if (!element) return console.warn("No target element");

  // Inform a parent window about an embed size
  const update = () => {
    const message = {
      width: Math.max(
        useScrollDimension ? element.scrollWidth : 0,
        element.offsetWidth,
      ),
      height: Math.max(
        useScrollDimension ? element.scrollHeight : 0,
        element.offsetHeight,
      ),
      updateStyleProps,
      href: window.location.href,
    };
    window.parent.postMessage(message, "*");
    if (debug) {
      console.log(message);
    }
  };
  if (timeout) {
    // Trigger event now and any time the window resizes
    window.addEventListener("resize", timeoutify(update, timeout));
  }
  update();
}
