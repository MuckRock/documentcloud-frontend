import type { Page, Project, ProjectMembershipItem } from "$lib/api/types";

import {
  vi,
  describe,
  it,
  test as base,
  expect,
  beforeEach,
  afterEach,
} from "vitest";

import {
  APP_URL,
  BASE_API_URL,
  CSRF_HEADER_NAME,
  EMBED_URL,
} from "@/config/config";
import { project, projectList } from "@/test/fixtures/projects";

import * as projects from "../projects";

type Use<T> = (value: T) => Promise<void>;

const test = base.extend({
  async documents({}, use: Use<Page<ProjectMembershipItem>>) {
    const { default: documents } = await import(
      "@/test/fixtures/projects/project-documents.json"
    );

    await use(documents);
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
    const { data: res, error } = await projects.get(1, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`${BASE_API_URL}projects/1/`),
      {
        credentials: "include",
      },
    );
    expect(error).toBeUndefined();
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
    const { data: res, error } = await projects.list({}, mockFetch);

    expect(mockFetch).toHaveBeenCalledWith(
      new URL("projects/", BASE_API_URL),
      expect.any(Object),
    );
    expect(error).toBeUndefined();
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

describe("projects for users", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("projects.getForUser", async () => {
    const mockFetch = vi.fn().mockImplementation(async (endpont, options) => {
      return {
        ok: true,
        status: 200,
        async json() {
          return projectList;
        },
      };
    });

    const result = await projects.getForUser(1, undefined, mockFetch);

    expect(result).toMatchObject(projectList.results);
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`projects/?user=1&per_page=100`, BASE_API_URL),
      { credentials: "include" },
    );
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

    const { data: created, error } = await projects.create(
      data,
      "token",
      mockFetch,
    );

    expect(error).toBeUndefined();
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

    const { data: updated, error } = await projects.edit(
      project.id,
      update,
      "token",
      mockFetch,
    );

    expect(error).toBeUndefined();
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

    const { error } = await projects.destroy(project.id, "token", mockFetch);

    expect(error).toBeUndefined();
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
      new URL(`/projects/${project.id}-${project.slug}/`, APP_URL),
    );
  });

  test("projects.embedUrl", () => {
    const url = projects.embedUrl(project);
    expect(url).toStrictEqual(
      new URL(`/projects/${project.id}-${project.slug}/?embed=1`, EMBED_URL),
    );
  });
});

describe("manage project documents", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("projects.add", async ({ documents }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      const docs = JSON.parse(options.body).map((d) => {
        d.edit_access = true;
        return d;
      });

      return {
        ok: true,
        status: 201,
        async json() {
          return docs;
        },
      };
    });

    const ids = documents.results.map((d) => d.document as number);
    const { data: docs, error } = await projects.add(
      1,
      ids,
      "token",
      mockFetch,
    );

    expect(error).toBeUndefined();
    expect(docs).toMatchObject(documents.results);
    expect(mockFetch).toBeCalledWith(
      new URL("projects/1/documents/", BASE_API_URL),
      {
        body: JSON.stringify(ids.map((document) => ({ document }))),
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

  test("projects.remove", async ({ documents }) => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      return {
        ok: true,
        status: 204,
      };
    });
    const ids = documents.results.map((d) => d.document as number);
    const endpoint = new URL(`projects/1/documents/`, BASE_API_URL);
    endpoint.searchParams.set("document_id__in", ids.join(","));

    expect(await projects.remove(1, ids, "token", mockFetch));
    expect(mockFetch).toBeCalledWith(endpoint, {
      credentials: "include",
      headers: {
        "Content-type": "application/json",
        [CSRF_HEADER_NAME]: "token",
        Referer: APP_URL,
      },
      method: "DELETE",
    });
  });
});
