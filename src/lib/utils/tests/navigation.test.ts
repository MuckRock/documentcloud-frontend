/**
 * @vitest-environment jsdom
 * @vitest-environment-options { "url": "https://www.dev.documentcloud.org/documents/20000065-creating-adaptable-skills-a-nonlinear-pedagogy-approach-to-mental-imagery/?mode=search&embed=1&q=pedagogy&title=0" }
 */

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { breadcrumbTrail, qs } from "../navigation";

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

describe("querystring links", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("adds new query params to existing URL params", () => {
    const links = [
      "https://www.dev.documentcloud.org/documents/20000065-creating-adaptable-skills-a-nonlinear-pedagogy-approach-to-mental-imagery/?mode=document#document/p1",
      "https://www.dev.documentcloud.org/documents/20000065-creating-adaptable-skills-a-nonlinear-pedagogy-approach-to-mental-imagery/?mode=notes",
      "https://www.dev.documentcloud.org/documents/20000065-creating-adaptable-skills-a-nonlinear-pedagogy-approach-to-mental-imagery/?mode=document",
    ];

    const fixed = [
      "?mode=document&embed=1&q=pedagogy&title=0",
      "?mode=notes&embed=1&q=pedagogy&title=0",
      "?mode=document&embed=1&q=pedagogy&title=0",
    ];

    links.forEach((href, i) => {
      // create the link
      let a = document.createElement("a");
      a.href = href;
      a.textContent = "test";

      // fix the link
      qs(a);

      expect(new URL(a.href).search).toEqual(fixed[i]);
    });
  });
});
