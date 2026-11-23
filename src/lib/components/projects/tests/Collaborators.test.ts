import type { Nullable, ProjectUser, User } from "$lib/api/types";

import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/svelte";

vi.mock("$app/forms", () => ({ enhance: () => ({}) }));

vi.mock("$app/state", () => ({
  page: { data: {} as { me?: Nullable<User> } },
}));

import { page } from "$app/state";
import Collaborators from "../Collaborators.svelte";
import { getUserName } from "$lib/api/accounts";
import { me, usersList } from "@/test/fixtures/accounts";
import { editableProject } from "@/test/fixtures/projects";

const bob = usersList.results[0] as User;
const bobName = getUserName(bob);

const project = { ...editableProject, add_remove_access: true };

const members: ProjectUser[] = [
  { user: me, access: "admin" },
  { user: bob, access: "edit" },
];

describe("Collaborators — self vs. other member controls", () => {
  it("hides Change Access / Remove on your own row but shows them for others", () => {
    page.data.me = me;

    render(Collaborators, { props: { project, users: members } });

    // one row's worth of controls (Bob's), not two
    expect(screen.getAllByTitle("Change Access")).toHaveLength(1);
    expect(screen.getAllByTitle("Remove Collaborator")).toHaveLength(1);

    // and they belong to Bob's row, not mine
    const bobRow = screen.getByText(bobName).closest(".navItem") as HTMLElement;
    const myRow = screen
      .getByText(getUserName(me))
      .closest(".navItem") as HTMLElement;

    expect(within(bobRow).getByTitle("Change Access")).toBeInTheDocument();
    expect(within(myRow).queryByTitle("Change Access")).not.toBeInTheDocument();
  });

  it("hides every row's controls when the signed-in user isn't a member and lacks edit access", () => {
    page.data.me = { ...me, id: 999999 };

    render(Collaborators, {
      props: { project: { ...project, edit_access: false }, users: members },
    });

    expect(screen.queryByTitle("Change Access")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Remove Collaborator")).not.toBeInTheDocument();
  });

  it("shows every row's controls (none excluded) when signed out and the project grants edit access", () => {
    page.data.me = null;

    render(Collaborators, {
      props: { project: { ...project, edit_access: true }, users: members },
    });

    // neither row belongs to a signed-out "me", so nothing is excluded as self
    expect(screen.getAllByTitle("Change Access")).toHaveLength(2);
    expect(screen.getAllByTitle("Remove Collaborator")).toHaveLength(2);
  });
});

describe("Collaborators — managing collaborators requires edit_access", () => {
  const adminOnly = {
    ...editableProject,
    edit_access: true,
    add_remove_access: false,
  };
  const editorOnly = {
    ...editableProject,
    edit_access: false,
    add_remove_access: true,
  };

  it("lets a user with edit_access open the invite form", async () => {
    page.data.me = me;

    render(Collaborators, { props: { project: adminOnly, users: members } });

    await fireEvent.click(screen.getByRole("button", { name: "Invite" }));

    expect(
      screen.getByRole("heading", { name: "Invite Collaborators" }),
    ).toBeInTheDocument();
  });

  it("lets a user with edit_access open the change-access form", async () => {
    page.data.me = me;

    render(Collaborators, { props: { project: adminOnly, users: members } });

    await fireEvent.click(screen.getByTitle("Change Access"));

    expect(
      screen.getByRole("heading", { name: "Change Access" }),
    ).toBeInTheDocument();
  });

  it("lets a user with edit_access open the remove form", async () => {
    page.data.me = me;

    render(Collaborators, { props: { project: adminOnly, users: members } });

    await fireEvent.click(screen.getByTitle("Remove Collaborator"));

    expect(
      screen.getByRole("heading", { name: "Remove Collaborator" }),
    ).toBeInTheDocument();
  });

  it("hides invite, change-access and remove controls from an editor who only has add_remove_access", () => {
    page.data.me = me;

    render(Collaborators, { props: { project: editorOnly, users: members } });

    expect(
      screen.queryByRole("button", { name: "Invite" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTitle("Change Access")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Remove Collaborator")).not.toBeInTheDocument();
  });

  it("shows the collaborators panel on a project with no members when the user has edit_access", () => {
    page.data.me = me;

    render(Collaborators, { props: { project: adminOnly, users: [] } });

    expect(screen.getByText("Collaborators")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Invite" })).toBeInTheDocument();
  });
});
