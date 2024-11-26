import { describe, test, expect } from "vitest";
import {
  settingsConfig,
  createEmbedSearchParams,
  getEmbedSettings,
  defaultSettings,
  isEmbed,
  reroute,
} from "../embed";

describe("embed settings", () => {
  test("settingsConfig", () => {
    expect(settingsConfig).toMatchSnapshot();
  });

  test("createEmbedSearchParams", () => {
    expect(createEmbedSearchParams({ title: null }).toString()).toEqual("");
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
