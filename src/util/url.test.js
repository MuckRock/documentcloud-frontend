import { queryBuilder, urlParts, getQueryStringParams, urlsEqual } from "./url";

test("query builder simple", () => {
  expect(queryBuilder("app/", { hi: true })).toBe("app/?hi=true");
});

test("query builder replace", () => {
  expect(queryBuilder("app/?hi=true", { hi: false })).toBe("app/?hi=false");
});

test("query builder omit", () => {
  expect(queryBuilder("app/?hi=true", {})).toBe("app/?hi=true");
});

test("query builder remove", () => {
  expect(queryBuilder("app/?hi=true", { hi: null })).toBe("app/");
});

test("query builder omit clean slate", () => {
  expect(queryBuilder("app/?hi=true", {}, true)).toBe("app/");
});

test("url parts", () => {
  expect(urlParts("app/?hi=true")).toEqual(["app/", "hi=true"]);
  expect(urlParts("app/?hi=true???")).toEqual(["app/", "hi=true???"]);
  expect(urlParts("app/")).toEqual(["app/", null]);
});

test("extract query params", () => {
  expect(getQueryStringParams("app/?hi=true")).toEqual({ hi: "true" });
  expect(getQueryStringParams("app/?page=2&hi=false")).toEqual({
    hi: "false",
    page: "2",
  });
});

test("urls equal", () => {
  expect(urlsEqual("app/", "app2/")).toBeFalsy();
  expect(urlsEqual("app/", "app/")).toBeTruthy();
  expect(urlsEqual("app/?q=1", "app/?q=1")).toBeTruthy();
  expect(urlsEqual("app/?q=1", "app/?q=2")).toBeFalsy();
  expect(urlsEqual("app/?q=1", "app/?")).toBeFalsy();
  expect(urlsEqual("app/?q=1", "app/")).toBeFalsy();
  expect(urlsEqual("app/?q=1&dq=2", "app/?q=1&dq=3")).toBeFalsy();
  expect(urlsEqual("app/?q=1&dq=2", "app/?q=1&dq=2")).toBeTruthy();
  expect(urlsEqual("app/?dq=2&q=1", "app/?q=1&dq=2")).toBeTruthy();
  expect(urlsEqual("app/?dq=2&q=1", "app/?q=1&dq=2&x=1")).toBeFalsy();
  expect(urlsEqual("app/?x=1&dq=2&q=1", "app/?q=1&dq=2&x=1")).toBeTruthy();
});
