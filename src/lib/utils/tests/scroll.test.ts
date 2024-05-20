import { vi, test, expect, describe, afterEach, beforeEach } from "vitest";
import { scrollToPage } from "../scroll";
import { pageHashUrl } from "$lib/api/documents";

describe("scroll helpers", () => {
  const pages = Array(10)
    .fill(undefined)
    .map((u, i) => {
      const div = document.createElement("div");
      const n = i + 1;
      div.id = pageHashUrl(n).replace("#", "");
      div.textContent = `Page ${n}`;

      return div;
    });

  beforeEach(() => {
    // window.document.body.innerHTML = pages.join("\n");
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("scrollToPage", () => {
    const scrollIntoView = vi.fn().mockImplementation(function () {
      console.log(this);
    });
    const getElementById = vi
      .spyOn(document, "getElementById")
      .mockImplementation(
        (elementId: string) =>
          pages.find((div) => div.id === elementId) || null,
      );

    // scrollIntoView doesn't exist on the JSDom HTMLElement for some reason
    // https://stackoverflow.com/questions/41098009/mocking-document-in-jest
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    expect(scrollToPage(5)).toBeUndefined();

    // check that we found the right element
    expect(getElementById).toBeCalledWith(pageHashUrl(5).replace("#", ""));

    expect(scrollToPage(70)).toBeUndefined(); // not a page, no-op

    // only called on the page that exists
    expect(scrollIntoView).toBeCalledTimes(1);
  });
});
