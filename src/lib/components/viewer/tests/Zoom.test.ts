import { test, expect } from "vitest";
import { getDefaultZoom, zoomToScale, zoomToSize } from "../Zoom.svelte";

test("zoomToScale", () => {
  expect(zoomToScale("width")).toEqual("width");
  expect(zoomToScale("height")).toEqual("height");
  expect(zoomToScale(1.1)).toEqual(1.1);
  expect(zoomToScale("1.2")).toEqual(1.2);
  expect(zoomToScale(undefined)).toEqual(1);
  expect(zoomToScale("foobar")).toEqual(1);
});

test("zoomToSize", () => {
  expect(zoomToSize("xlarge")).toEqual("xlarge");
  expect(zoomToSize("large")).toEqual("large");
  expect(zoomToSize(2000)).toEqual("small");
});

test("getDefaultZoom", () => {
  expect(getDefaultZoom("document")).toEqual("width");
  expect(getDefaultZoom("text")).toEqual(1);
  expect(getDefaultZoom("grid")).toEqual("small");
  expect(getDefaultZoom("notes")).toEqual(1);
  expect(getDefaultZoom("annotating")).toEqual("width");
  expect(getDefaultZoom("redacting")).toEqual("width");
});
