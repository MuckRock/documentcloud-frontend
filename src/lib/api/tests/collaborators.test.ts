import type { Page, Project, ProjectAccess, ProjectUser, User } from "../types";

import { afterEach, describe, expect, test as base, vi } from "vitest";
import { APP_URL, BASE_API_URL, CSRF_HEADER_NAME } from "@/config/config.js";
import * as collaborators from "../collaborators";

type Use<T> = (value: T) => Promise<void>;

const test = base.extend({
  async me({}, use: Use<User>) {
    const { me } = await import("@/test/fixtures/accounts");

    await use(me);
  },

  async project({}, use: Use<Project>) {
    const { project } = await import("@/test/fixtures/projects");

    await use(project);
  },

  async users({}, use: Use<Page<ProjectUser>>) {
    const { default: users } = await import(
      "@/test/fixtures/projects/project-users.json"
    );

    await use(users as Page<ProjectUser>);
  },
});

describe("manage project users", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("collaborators.list", async ({ project, users }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 200,
        async json() {
          return users;
        },
      };
    });

    const result = await collaborators.list(project.id, mockFetch);

    expect(result).toEqual(users.results);
    expect(mockFetch).toBeCalledWith(
      new URL(
        `projects/${project.id}/users/?expand=user&per_page=100`,
        BASE_API_URL,
      ),
      { credentials: "include" },
    );
  });

  test("collaborators.add", async ({ project, users, me }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      // this doesn't have uniform expansion but I think that's ok for now
      const updated = [...users.results, { user: me, access: "admin" }];
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            ...users,
            results: updated,
          };
        },
      };
    });

    const { data } = await collaborators.add(
      project.id,
      { email: me.email, access: "admin" },
      "token",
      mockFetch,
    );

    expect(data).toMatchObject({
      previous: null,
      next: null,
      results: [...users.results, { user: me, access: "admin" }],
    });

    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`projects/${project.id}/users/`, BASE_API_URL),
      {
        body: JSON.stringify({ email: me.email, access: "admin" }),
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: "token",
          Referer: APP_URL,
        },
        method: "POST",
      },
    );
  });

  test("collaborators.update", async ({ project, users }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      const { user, access } = JSON.parse(options.body);
      const updated: ProjectUser = users.results.find(
        (u) => u.user.id === 1020,
      );

      return {
        ok: true,
        status: 200,
        async json() {
          return {
            user: updated.user,
            access,
          };
        },
      };
    });

    const me = users.results.find((u) => u.user.id === 1020);

    const { data: updated } = await collaborators.update(
      project.id,
      me.user.id,
      "edit",
      "token",
      mockFetch,
    );

    expect(updated).toMatchObject({ user: me.user, access: "edit" });
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`projects/${project.id}/users/${me.user.id}/`, BASE_API_URL),
      {
        body: JSON.stringify({ user: me.user.id, access: "edit" }),
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: "token",
          Referer: APP_URL,
        },
        method: "PATCH",
      },
    );
  });

  test("collaborators.remove", async ({ project, users }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 204,
        async json() {},
      };
    });

    const me = users.results.find((u) => u.user.id === 1020);
    const { data } = await collaborators.remove(
      project.id,
      me.user.id,
      "token",
      mockFetch,
    );

    expect(data).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`projects/${project.id}/users/${me.user.id}/`, BASE_API_URL),
      {
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: "token",
          Referer: APP_URL,
        },
        method: "DELETE",
      },
    );
  });
});
