import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import ShowSizeDemo from "./ShowSize.demo.svelte";
import { MAX_EDIT_BATCH } from "@/config/config.js";

describe("ShowSize.svelte", () => {
  it("renders default slot when size is within valid range", () => {
    const { getByText } = render(ShowSizeDemo, {
      props: {
        size: 5,
      },
    });

    expect(getByText("5 items")).toBeTruthy();
  });

  it("renders oversize slot when size exceeds MAX_EDIT_BATCH", () => {
    const { getByText } = render(ShowSizeDemo, {
      props: {
        size: MAX_EDIT_BATCH + 1,
      },
    });
    expect(getByText("Too many items!")).toBeTruthy();
  });

  it("renders empty slot when size is 0", () => {
    const { getByText } = render(ShowSizeDemo, {
      props: {
        size: 0,
      },
    });
    expect(getByText("Zero items")).toBeTruthy();
  });
});
