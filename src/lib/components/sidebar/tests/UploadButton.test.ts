import type { Nullable, User } from "$lib/api/types";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { setContext } from "svelte";
import { get, writable } from "svelte/store";

vi.mock("$app/navigation", () => ({ goto: vi.fn() }));

import { goto } from "$app/navigation";
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

// https://svelte.dev/docs/svelte/context#Component-testing
function withUser(user: Nullable<User>) {
  return function Wrapper(...args: Parameters<typeof UploadButton>) {
    setContext("me", writable(user));
    return UploadButton(...args);
  };
}

describe("UploadButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadToProject.set(null);
  });

  it("renders nothing when signed out", () => {
    render(withUser(null));

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders nothing for a signed-in user who isn't verified or staff", () => {
    render(withUser(unverifiedUser));

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders an upload link for a verified journalist with no project", () => {
    render(withUser(me));

    const link = screen.getByRole("link", { name: /upload/i });
    expect(link).toHaveAttribute("href", "/upload/");
  });

  it("renders an enabled upload-to-project button when the project is editable", async () => {
    render(withUser(me), { props: { project: editableProject } });

    const btn = screen.getByRole("button", { name: /upload/i });
    expect(btn).toBeEnabled();

    await fireEvent.click(btn);

    expect(mockGoto).toHaveBeenCalledWith("/upload/");
    expect(get(uploadToProject)).toEqual(editableProject);
  });

  it("sets the upload target and disables the button when the project isn't editable", () => {
    render(withUser(me), {
      props: { project: { ...privateProject, edit_access: false } },
    });

    const btn = screen.getByRole("button", { name: /upload/i });
    expect(btn).toBeDisabled();
  });
});
