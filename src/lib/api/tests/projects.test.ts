import type { Page, Project, ProjectUser } from "$lib/api/types";

import {
  vi,
  describe,
  it,
  test as base,
  expect,
  beforeEach,
  afterEach,
} from "vitest";

import { APP_URL, BASE_API_URL, CSRF_HEADER_NAME } from "@/config/config";
import { project, projectList } from "@/test/fixtures/projects";

import * as projects from "../projects";

type Use<T> = (value: T) => Promise<void>;

const test = base.extend({
  async users({}, use: Use<Page<ProjectUser>>) {
    const { default: users } = await import(
      "@/test/fixtures/projects/project-users.json"
    );

    await use(users as Page<ProjectUser>);
  },
});

describe("projects.get", () => {
  let mockFetch;
  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => project,
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("fetches a single project by ID", async () => {
    let res = await projects.get(1, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`${BASE_API_URL}projects/1/`),
      {
        credentials: "include",
      },
    );
    expect(res).toBe(project);
  });
  it("throws a 500 error if fetch fails", async () => {
    mockFetch = vi.fn().mockRejectedValue("Error");
    await expect(projects.get(1, mockFetch)).rejects.toThrowError();
  });
  it("throws an error if fetch succeeds with an error status", async () => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Whoops",
    });
    await expect(projects.get(1, mockFetch)).rejects.toThrowError();
  });
});

describe("projects.list", () => {
  let mockFetch;
  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => projectList,
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("fetches a list of projects", async () => {
    const res = await projects.list({}, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith(
      new URL("projects/", BASE_API_URL),
      expect.any(Object),
    );
    expect(res).toBe(projectList);
  });
  it("attaches any params to the URL as searchParams", async () => {
    await projects.list({ foo: "bar", bip: "bimbap", yo: "lo" }, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`${BASE_API_URL}projects/?foo=bar&bip=bimbap&yo=lo`),
      expect.any(Object),
    );
  });
  it("throws a 500 error if fetch fails", async () => {
    mockFetch = vi.fn().mockRejectedValue("Error");
    await expect(projects.list({}, mockFetch)).rejects.toThrowError();
  });
  it("throws an error if fetch succeeds with an error status", async () => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Whoops",
    });
    await expect(projects.list({}, mockFetch)).rejects.toThrowError();
  });
});

describe("projects.getOwned", () => {
  let mockFetch;
  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => projectList,
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("only returns projects that belong to the user", async () => {
    const res = await projects.getOwned(100003, undefined, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`${BASE_API_URL}projects/?user=100003&per_page=100`),
      expect.any(Object),
    );
    expect(res).toEqual([projectList.results[0]]);
  });
  it("also applies a search query to the request, if provided", async () => {
    await projects.getOwned(100003, "dinosaurs", mockFetch);
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(
        `${BASE_API_URL}projects/?user=100003&query=dinosaurs&per_page=100`,
      ),
      expect.any(Object),
    );
  });
});

describe("projects.getShared", () => {
  let mockFetch;
  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => projectList,
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("only returns projects that do not belong to the user", async () => {
    const res = await projects.getShared(100003, undefined, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`${BASE_API_URL}projects/?user=100003&per_page=100`),
      expect.any(Object),
    );
    expect(res).toEqual(projectList.results.slice(1));
  });
  it("also applies a search query to the request, if provided", async () => {
    await projects.getShared(100003, "dinosaurs", mockFetch);
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(
        `${BASE_API_URL}projects/?user=100003&query=dinosaurs&per_page=100`,
      ),
      expect.any(Object),
    );
  });
});

describe("projects.pinProject", () => {
  let mockFetch;
  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ...project, pinned: !project.pinned }),
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("makes a PATCH request to the provided project ID", async () => {
    await projects.pinProject(1, false, "csrftoken", mockFetch);
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`${BASE_API_URL}projects/1/`),
      {
        credentials: "include",
        method: "PATCH",
        headers: {
          "X-CSRFToken": "csrftoken",
          "Content-type": "application/json",
        },
        body: `{"pinned":false}`,
      },
    );
  });
  it("throws a 500 error if fetch fails", async () => {
    mockFetch = vi.fn().mockRejectedValue("Error");
    await expect(
      projects.pinProject(1, false, "csrftoken", mockFetch),
    ).rejects.toThrowError();
  });
  it("throws an error if fetch succeeds with an error status", async () => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Whoops",
    });
    await expect(
      projects.pinProject(1, false, "csrftoken", mockFetch),
    ).rejects.toThrowError();
  });
});

describe("project user management", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  test("projects.users", async ({ users }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 200,
        async json() {
          return users;
        },
      };
    });

    const result = await projects.users(1, mockFetch);

    expect(result).toEqual(users.results);
    expect(mockFetch).toBeCalledWith(
      new URL("projects/1/users/?expand=user&per_page=100", BASE_API_URL),
      { credentials: "include" },
    );
  });
});

describe("project lifecycle", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("projects.create", async () => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 201,
        async json() {
          return project;
        },
      };
    });

    const data = {
      title: project.title,
      description: project.description,
      private: project.private,
      pinned: project.pinned,
    };

    const created = await projects.create(data, "token", mockFetch);

    expect(created).toMatchObject(project);
    expect(mockFetch).toBeCalledWith(new URL("projects/", BASE_API_URL), {
      body: JSON.stringify(data),
      credentials: "include",
      headers: {
        "Content-type": "application/json",
        [CSRF_HEADER_NAME]: "token",
        Referer: APP_URL,
      },
      method: "POST",
    });
  });

  test("projects.edit", async () => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      const update = JSON.parse(options.body);
      return {
        ok: true,
        status: 200,
        async json() {
          return { ...project, ...update };
        },
      };
    });

    const update: Partial<Project> = { title: "New title" };

    const updated = await projects.edit(project.id, update, "token", mockFetch);

    expect(updated).toMatchObject({ ...project, ...update });
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`projects/${project.id}/`, BASE_API_URL),
      {
        body: JSON.stringify(update),
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

  test("projects.destroy", async () => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 204,
      };
    });

    const resp = await projects.destroy(project.id, "token", mockFetch);

    expect(resp.status).toEqual(204);
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`projects/${project.id}/`, BASE_API_URL),
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

describe("project utils", () => {
  test("projects.canonicalUrl", () => {
    const url = projects.canonicalUrl(project);
    expect(url).toStrictEqual(
      new URL(`documents/projects/${project.id}-${project.slug}/`, APP_URL),
    );
  });
});

test.todo("projects.documents");
