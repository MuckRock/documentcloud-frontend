import type { Nullable, User } from "$lib/api/types";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$app/navigation", () => ({ goto: vi.fn() }));

vi.mock("$app/state", () => ({
  page: { data: {} as { me?: Nullable<User> } },
}));

import { goto } from "$app/navigation";
import { page } from "$app/state";
import UploadButton from "../UploadButton.svelte";
import { uploadToProject } from "$lib/components/forms/Upload.svelte";
import { me } from "@/test/fixtures/accounts";
import { editableProject, privateProject } from "@/test/fixtures/projects";

const mockGoto = vi.mocked(goto);

const unverifiedUser: User = {
  ...me,
  verified_journalist: false,
  is_staff: false,
};

describe("UploadButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadToProject.set(null);
  });

  it("renders nothing when signed out", () => {
    page.data.me = null;

    render(UploadButton);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders nothing for a signed-in user who isn't verified or staff", () => {
    page.data.me = unverifiedUser;

    render(UploadButton);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders an upload link for a verified journalist with no project", () => {
    page.data.me = me;

    render(UploadButton);

    const link = screen.getByRole("link", { name: /upload/i });
    expect(link).toHaveAttribute("href", "/upload/");
  });

  it("renders an enabled upload-to-project button when the project is editable", async () => {
    page.data.me = me;

    render(UploadButton, { props: { project: editableProject } });

    const btn = screen.getByRole("button", { name: /upload/i });
    expect(btn).toBeEnabled();

    await fireEvent.click(btn);

    expect(mockGoto).toHaveBeenCalledWith("/upload/");
    expect(get(uploadToProject)).toEqual(editableProject);
  });

  it("sets the upload target and disables the button when the project isn't editable", () => {
    page.data.me = me;

    render(UploadButton, {
      props: { project: { ...privateProject, edit_access: false } },
    });

    const btn = screen.getByRole("button", { name: /upload/i });
    expect(btn).toBeDisabled();
  });
});
