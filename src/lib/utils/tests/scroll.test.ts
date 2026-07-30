import { vi, test, expect, describe, afterEach, beforeEach } from "vitest";
import { scrollToId, scrollToPage } from "../scroll";
import { pageHashUrl } from "$lib/api/documents";

const pageId = (n: number) => pageHashUrl(n).replace("#", "");

/**
 * A watcher waiting for a target to render keeps a timer alive. Real scrolling
 * calls it off, which is also how a test tears one down.
 */
function stopWaiting() {
  window.dispatchEvent(new Event("wheel"));
}

describe("scroll helpers", () => {
  const pages = Array(10)
    .fill(undefined)
    .map((u, i) => {
      const div = document.createElement("div");
      const n = i + 1;
      div.id = pageId(n);
      div.textContent = `Page ${n}`;

      return div;
    });

  beforeEach(() => {
    // scrollIntoView doesn't exist on the JSDom HTMLElement for some reason
    // https://stackoverflow.com/questions/41098009/mocking-document-in-jest
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    stopWaiting();
    window.document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  test("scrollToPage", () => {
    const scrollIntoView = HTMLElement.prototype.scrollIntoView;
    const getElementById = vi
      .spyOn(document, "getElementById")
      .mockImplementation(
        (elementId: string) =>
          pages.find((div) => div.id === elementId) || null,
      );

    expect(scrollToPage(5)).toBeUndefined();

    // check that we found the right element
    expect(getElementById).toBeCalledWith(pageId(5));

    expect(scrollToPage(70)).toBeUndefined(); // not a page, nothing to scroll to

    // only called on the page that exists
    expect(scrollIntoView).toBeCalledTimes(1);
  });

  test("scrollToId waits for a target that hasn't rendered yet", async () => {
    const scrollIntoView = HTMLElement.prototype.scrollIntoView;

    scrollToId(pageId(3));
    expect(scrollIntoView).not.toBeCalled();

    // Text mode renders its pages once the text response arrives, well after the
    // deep link asks for one.
    const div = document.createElement("div");
    div.id = pageId(3);
    window.document.body.appendChild(div);

    await vi.waitFor(() => expect(scrollIntoView).toBeCalledTimes(1));
  });

  test("scrollToId stops waiting once the reader scrolls", async () => {
    const scrollIntoView = HTMLElement.prototype.scrollIntoView;

    scrollToId(pageId(4));
    stopWaiting();

    const div = document.createElement("div");
    div.id = pageId(4);
    window.document.body.appendChild(div);

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(scrollIntoView).not.toBeCalled();
  });
});
