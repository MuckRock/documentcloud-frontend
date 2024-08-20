import { vi, describe, it, test, expect, beforeEach, afterEach } from "vitest";

import { BASE_API_URL } from "@/config/config";
import { project, projectList } from "@/test/fixtures/projects";

import * as projects from "../projects";

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
    await projects.pinProject("csrftoken", 1, false, mockFetch);
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
      projects.pinProject("csrftoken", 1, false, mockFetch),
    ).rejects.toThrowError();
  });
  it("throws an error if fetch succeeds with an error status", async () => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Whoops",
    });
    await expect(
      projects.pinProject("csrftoken", 1, false, mockFetch),
    ).rejects.toThrowError();
  });
});

test.todo("projects.documents");
