import { test, expect } from "vitest";
import { settingsConfig, createEmbedSearchParams } from "../embed";

test("settingsConfig", () => {
  expect(settingsConfig).toMatchSnapshot();
});

test("createEmbedSearchParams", () => {
  expect(createEmbedSearchParams({ embed: 1 }).toString()).toEqual("embed=1");
  expect(
    createEmbedSearchParams({ embed: 1, responsive: null }).toString(),
  ).toEqual("embed=1");
});
