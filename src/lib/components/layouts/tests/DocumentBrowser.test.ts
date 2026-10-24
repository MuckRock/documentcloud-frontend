import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { get } from "svelte/store";
import { page } from "$app/state";
import { goto } from "$app/navigation";
import { me } from "@/test/fixtures/accounts";
import { editableProject } from "@/test/fixtures/projects";
import { sidebars } from "../Sidebar.svelte";
import { uploadToProject } from "$lib/components/forms/Upload.svelte";
import DocumentBrowser from "./DocumentBrowser.demo.svelte";

vi.mock("$app/navigation", () => ({ goto: vi.fn() }));
vi.mock("$app/state", () => ({
  page: {
    data: { me: null },
    url: new URL("https://www.documentcloud.org/documents/"),
  },
}));

describe("DocumentBrowser upload when actions are collapsed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (page.data as any).me = me;
    sidebars.set({ action: false, navigation: false });
    uploadToProject.set(null);
  });

  it("shows an upload link in the visible toolbar", () => {
    render(DocumentBrowser);
    expect(
      screen.getByRole("link", { name: "Upload Documents" }),
    ).toHaveAttribute("href", "/upload/");
  });

  it("keeps the project destination when using the toolbar upload", async () => {
    render(DocumentBrowser, { project: editableProject });
    await fireEvent.click(
      screen.getByRole("button", { name: "Upload to Project" }),
    );
    expect(goto).toHaveBeenCalledWith("/upload/");
    expect(get(uploadToProject)).toEqual(editableProject);
  });

  it.each([null, { ...me, verified_journalist: false, is_staff: false }])(
    "does not offer uploads without permission",
    (user) => {
      (page.data as any).me = user;
      render(DocumentBrowser);
      expect(
        screen.queryByRole("link", { name: "Upload Documents" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Upload to Project" }),
      ).not.toBeInTheDocument();
    },
  );

  it("does not add upload controls to embeds or expanded actions", () => {
    const { unmount } = render(DocumentBrowser, { embed: true });
    expect(
      screen.queryByRole("link", { name: "Upload Documents" }),
    ).not.toBeInTheDocument();
    unmount();
    sidebars.set({ action: true });
    render(DocumentBrowser);
    expect(
      screen.queryByRole("link", { name: "Upload Documents" }),
    ).not.toBeInTheDocument();
  });
});
