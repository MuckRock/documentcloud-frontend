import { vi, describe, it, expect } from "vitest";
import {
  render,
  screen,
  fireEvent,
  createEvent,
} from "@testing-library/svelte";

import Dropzone from "../Dropzone.svelte";

describe("Dropzone", () => {
  it("fires a handler upon a drop event", () => {
    const onDrop = vi.fn();
    render(Dropzone, {
      onDrop,
    });
    const dropElement = screen.getByRole("button");
    const dropEvent = createEvent.drop(dropElement);
    const fileList = [new File([], "file.pdf")];
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: fileList,
      },
    });
    fireEvent(dropElement, dropEvent);
    expect(onDrop).toHaveBeenCalledWith(fileList);
  });
  it("does not fire if disabled", () => {
    const onDrop = vi.fn();
    render(Dropzone, {
      onDrop,
      disabled: true,
    });
    const dropElement = screen.getByRole("button");
    const dropEvent = createEvent.drop(dropElement);
    const fileList = [new File([], "file.pdf")];
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: fileList,
      },
    });
    fireEvent(dropElement, dropEvent);
    expect(onDrop).not.toHaveBeenCalledWith(fileList);
  });
});
