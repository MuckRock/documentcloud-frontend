import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { breadcrumbTrail } from "../navigation";

describe("breadcrumbTrail", () => {
  it("returns an empty array as a base case", async () => {
    const parent = vi.fn().mockResolvedValue({});
    expect(await breadcrumbTrail(parent)).toEqual([]);
  });
  it("returns the parent's breadcrumb trail, if it exists", async () => {
    const parentTrail = [{ href: "/first", title: "First Level" }];
    const parent = vi.fn().mockResolvedValue({ breadcrumbs: parentTrail });
    expect(await breadcrumbTrail(parent)).toEqual(parentTrail);
  });
  it("concats the provided trail onto the parent's trail", async () => {
    const parentTrail = [{ href: "/first", title: "First Level" }];
    const childTrail = [{ href: "/second", title: "Second Level" }];
    const parent = vi.fn().mockResolvedValue({ breadcrumbs: parentTrail });
    expect(await breadcrumbTrail(parent, childTrail)).toEqual([
      ...parentTrail,
      ...childTrail,
    ]);
  });
});
