import { test, expect } from "vitest";
import {
  settingsConfig,
  createEmbedSearchParams,
  getEmbedSettings,
  defaultSettings,
} from "../embed";

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
