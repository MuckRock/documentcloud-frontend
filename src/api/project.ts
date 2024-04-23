/**
 * Methods related to the DocumentCloud project API
 */

import session from "./session.js";
import { apiUrl } from "./base.js";
import { grabAllPages } from "../util/paginate.js";
import { DEFAULT_ORDERING, DEFAULT_EXPAND } from "./common.js";
import { queryBuilder } from "../util/url.js";
import type { Page, Project, User, Document, DocumentAccess } from "./types";

// Create a project
export async function newProject(
  title: string,
  description: string,
  isPrivate: boolean,
): Promise<Project> {
  const { data } = await session.post(apiUrl("projects/"), {
    title,
    description,
    private: isPrivate,
  });
  return data;
}

export async function deleteProject(projectId: number): Promise<void> {
  // Delete the project with the specified id
  await session.delete(apiUrl(`projects/${projectId}/`));
}

// Update a project
export async function updateProject(
  projectId: number,
  title: string,
  description: string,
  isPrivate: boolean,
): Promise<Project> {
  const { data } = await session.patch(apiUrl(`projects/${projectId}/`), {
    title,
    description,
    private: isPrivate,
  });
  return data;
}

export async function addDocumentsToProject(
  projectId: number,
  docIds: number[],
): Promise<void> {
  await session.post(
    apiUrl(`projects/${projectId}/documents/`),
    docIds.map((id) => ({
      document: id,
    })),
  );
}

export async function removeDocumentsFromProject(
  projectId: number,
  docIds: number[],
): Promise<void> {
  await session.delete(
    apiUrl(
      `projects/${projectId}/documents/?document_id__in=${docIds
        .map(String)
        .join(",")}`,
    ),
  );
}

export async function getPublicProjects(
  cursor?: string,
  query?: string,
  expand: string = DEFAULT_EXPAND,
): Promise<Page<Project>> {
  // Returns all public projects
  const { data } = await session.get(
    queryBuilder(apiUrl("projects/"), {
      private: false,
      cursor,
      query,
      expand,
    }),
  );
  return data;
}

export async function getProjects(
  userId: number,
  query?: string,
  expand: string = DEFAULT_EXPAND,
): Promise<Project[]> {
  // Returns all projects
  const projects = await grabAllPages(
    queryBuilder(apiUrl("projects/"), { user: userId, query, expand }),
  );
  return projects;
}

export async function getProjectUsers(
  projectId: number,
  expand: string = DEFAULT_EXPAND,
): Promise<User[]> {
  const users = await grabAllPages(
    apiUrl(queryBuilder(`projects/${projectId}/users/`, { expand })),
  );
  return users;
}

export async function getProjectDocuments(
  projectId: number,
  extraParams: Record<string, unknown> = {},
  ordering: string = DEFAULT_ORDERING,
  expand: string = DEFAULT_EXPAND + ",document",
): Promise<[string, Page<Document>]> {
  // Return documents with the specified parameters
  const params = { ...extraParams, ordering, expand, version: "2.0" };
  const url = apiUrl(queryBuilder(`projects/${projectId}/documents/`, params));
  const { data } = await session.get(url);
  return [url, data];
}

export async function addUserToProject(
  projectId: number,
  email: string,
  access: DocumentAccess,
  expand: string = DEFAULT_EXPAND,
): Promise<Page<User>> {
  const { data: user } = await session.post(
    apiUrl(`projects/${projectId}/users/`),
    {
      email,
      access,
    },
  );
  // TODO: see if backend can get user expanded straight off the bat
  const { data } = await session.get(
    apiUrl(
      queryBuilder(`projects/${projectId}/users/${user.user}/`, { expand }),
    ),
  );
  return data;
}

export async function updateUserAccess(
  projectId: number,
  userId: string,
  access: DocumentAccess,
): Promise<void> {
  await session.patch(apiUrl(`projects/${projectId}/users/${userId}/`), {
    access,
  });
}

export async function removeUser(
  projectId: number,
  userId: string,
): Promise<void> {
  await session.delete(apiUrl(`projects/${projectId}/users/${userId}/`));
}
