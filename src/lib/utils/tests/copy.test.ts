import {
  describe,
  it,
  vi,
  beforeEach,
  afterEach,
  expect,
  type Mock,
} from "vitest";
import { toast } from "$lib/components/layouts/Toaster.svelte";
import { unwrapFunctionStore, _ } from "svelte-i18n";
import copy from "../copy";

// Mock the imports
vi.mock("$lib/components/layouts/Toaster.svelte", () => ({
  toast: vi.fn(),
}));

vi.mock("svelte-i18n", () => ({
  unwrapFunctionStore: vi.fn(),
  _: vi.fn(),
}));

describe("copy", () => {
  const mockUnwrapFunctionStore = unwrapFunctionStore as Mock;
  const mockToast = toast as Mock;

  beforeEach(() => {
    mockUnwrapFunctionStore.mockReturnValue((key: string) => key);

    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should copy text to clipboard and show success toast", async () => {
    const writeTextSpy = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValueOnce(undefined);

    await copy("test text");

    expect(writeTextSpy).toHaveBeenCalledWith("test text");
    expect(mockToast).toHaveBeenCalledWith("share.copiedToClipboard");
  });

  it("should show error toast when clipboard write fails", async () => {
    const writeTextSpy = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockRejectedValueOnce(
        new Error(
          "NotAllowedError: Failed to execute 'writeText' on 'Clipboard'",
        ),
      );

    expect(await copy("test text")).not.toThrowError;

    expect(writeTextSpy).toHaveBeenCalledWith("test text");
    expect(mockToast).toHaveBeenCalledWith("share.couldNotCopyToClipboard", {
      status: "error",
    });
  });
});
