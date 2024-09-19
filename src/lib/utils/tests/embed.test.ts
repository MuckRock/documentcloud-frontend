import { describe, test, expect } from "vitest";
import {
  settingsConfig,
  createEmbedSearchParams,
  getEmbedSettings,
  defaultSettings,
  isEmbed,
} from "../embed";

describe("embed settings", () => {
  test("settingsConfig", () => {
    expect(settingsConfig).toMatchSnapshot();
  });

  test("createEmbedSearchParams", () => {
    expect(createEmbedSearchParams({ embed: 1 }).toString()).toEqual("embed=1");
    expect(
      createEmbedSearchParams({ embed: 1, responsive: null }).toString(),
    ).toEqual("embed=1");
  });

  test("getEmbedSettings", () => {
    const url = new URL("", "https://www.documentcloud.org");
    url.searchParams.set("pdf", "false");
    url.searchParams.set("onlyshoworg", "true");
    expect(getEmbedSettings(url.searchParams)).toEqual({
      ...defaultSettings,
      pdf: "false",
      onlyshoworg: "true",
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
});
