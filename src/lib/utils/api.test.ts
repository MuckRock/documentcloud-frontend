import { test, expect } from "vitest";
import { isErrorCode, isRedirectCode } from "./api";

test("isErrorCode", () => {
  expect(isErrorCode(200)).toBe(false);
  expect(isErrorCode(204)).toBe(false);
  expect(isErrorCode(301)).toBe(false);
  expect(isErrorCode(307)).toBe(false);
  expect(isErrorCode(400)).toBe(true);
  expect(isErrorCode(404)).toBe(true);
  expect(isErrorCode(500)).toBe(true);
});

test("isRedirectCode", () => {
  expect(isRedirectCode(200)).toBe(false);
  expect(isRedirectCode(204)).toBe(false);
  expect(isRedirectCode(301)).toBe(true);
  expect(isRedirectCode(307)).toBe(true);
  expect(isRedirectCode(400)).toBe(false);
  expect(isRedirectCode(404)).toBe(false);
  expect(isRedirectCode(500)).toBe(false);
});
