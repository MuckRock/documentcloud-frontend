import { describe, test, expect } from "vitest";
import {
  settingsConfig,
  createEmbedSearchParams,
  getEmbedSettings,
  defaultSettings,
  isEmbed,
  reroute,
  truthy,
} from "../embed";

describe("embed settings", () => {
  test("settingsConfig", () => {
    expect(settingsConfig).toMatchSnapshot();
  });

  test("createEmbedSearchParams", () => {
    expect(createEmbedSearchParams({ title: null }).toString()).toEqual("");
    expect(createEmbedSearchParams({ title: 1 }).toString()).toEqual("title=1");
    expect(createEmbedSearchParams({ title: 1, pdf: 0 }).toString()).toEqual(
      "title=1&pdf=0",
    );
  });

  test("getEmbedSettings", () => {
    const url = new URL("https://www.documentcloud.org");
    url.searchParams.set("pdf", "false");
    url.searchParams.set("onlyshoworg", "true");
    url.searchParams.set("title", "0");
    expect(getEmbedSettings(url.searchParams)).toEqual({
      ...defaultSettings,
      pdf: false,
      onlyshoworg: true,
      title: 0,
      fullscreen: 1
    });
  });
});

describe("embed utilities", () => {
  test("isEmbed", () => {
    const urls: [string, boolean][] = [
      [
        "https://www.documentcloud.org/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/",
        false,
      ],
      [
        "https://www.documentcloud.org/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/?embed=1",
        true,
      ],
      [
        "https://embed.documentcloud.org/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/",
        true,
      ],
      [
        "https://embed.documentcloud.org/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/?embed=1",
        true,
      ],
      [
        "https://www.documentcloud.org/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/?embed",
        true,
      ],
      [
        "https://embed.documentcloud.org/_app/immutable/chunks/navigation.CziXxwWJ.js",
        false,
      ],
    ];

    for (const [url, embed] of urls) {
      expect(isEmbed(new URL(url))).toEqual(embed);
    }
  });

  test("embed reroute", () => {
    // [original, rewritten]
    const paths: [string, string][] = [
      ["/embed/documents/1-slug/", "/embed/documents/1-slug/"],
      ["/documents/1-slug/?embed=1", "/embed/documents/1-slug/"],
      [
        "https://embed.documentcloud.org/documents/1-slug/",
        "/embed/documents/1-slug/",
      ],
    ];

    for (const [original, rewritten] of paths) {
      const url = new URL(original, "https://www.documentcloud.org");
      expect(reroute({ url })).toEqual(rewritten);
    }
  });
});

test("truthy", () => {
  // Test undefined
  expect(truthy(undefined)).toBe(false);

  // Test null
  expect(truthy(null)).toBe(false);

  // Test boolean inputs
  expect(truthy(true)).toBe(true);
  expect(truthy(false)).toBe(false);

  // Test number inputs
  expect(truthy(1)).toBe(1);
  expect(truthy(0)).toBe(0);

  // Test string inputs for boolean values
  expect(truthy("true")).toBe(true);
  expect(truthy("false")).toBe(false);

  // Test string inputs for number values
  expect(truthy("1")).toBe(1);
  expect(truthy("0")).toBe(0);

  // Test JSON parsing
  expect(truthy('{"key": "value"}')).toEqual(true);
  expect(truthy("[1, 2, 3]")).toEqual(true);

  // Test invalid JSON string
  expect(truthy("invalid")).toBe(false);
});
