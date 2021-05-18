/**
 * Methods related to the DocumentCloud project API
 */

import session from "./session";
import { apiUrl } from "./base";
import { Project } from "@/structure/project";
import { grabAllPages } from "@/util/paginate";
import { DEFAULT_ORDERING, DEFAULT_EXPAND } from "./common";
import { queryBuilder } from "@/util/url";
import { Results } from "@/structure/results";
import { Document } from "@/structure/document";

export async function newProject(title, description) {
  // Create a project
  const { data } = await session.post(apiUrl("projects/"), {
    title,
    description,
  });
  return new Project(data);
}

export async function deleteProject(projectId) {
  // Delete the project with the specified id
  await session.delete(apiUrl(`projects/${projectId}/`));
}

export async function updateProject(projectId, title, description) {
  // Update a project
  const { data } = await session.patch(apiUrl(`projects/${projectId}/`), {
    title,
    description,
  });
  return new Project(data);
}

export async function addDocumentsToProject(projectId, docIds) {
  await session.post(
    apiUrl(`projects/${projectId}/documents/`),
    docIds.map((id) => ({
      document: id,
    })),
  );
}

export async function removeDocumentsFromProject(projectId, docIds) {
  await session.delete(
    apiUrl(
      `projects/${projectId}/documents/?document_id__in=${docIds
        .map((x) => `${x}`)
        .join(",")}`,
    ),
  );
}

export async function getProjects(userId, expand = DEFAULT_EXPAND) {
  // Returns all projects
  const projects = await grabAllPages(
    queryBuilder(apiUrl("projects/"), { user: userId, expand }),
  );
  return projects.map((project) => new Project(project));
}

export async function getProjectUsers(projectId, expand = DEFAULT_EXPAND) {
  const users = await grabAllPages(
    apiUrl(queryBuilder(`projects/${projectId}/users/`, { expand })),
  );
  return users;
}

export async function getProjectDocuments(
  projectId,
  page = 0,
  extraParams = {},
  ordering = DEFAULT_ORDERING,
  expand = DEFAULT_EXPAND + ",document",
) {
  // Return documents with the specified parameters
  const params = { ...extraParams, ordering, expand, page: page + 1 };
  const url = apiUrl(queryBuilder(`projects/${projectId}/documents/`, params));
  const { data } = await session.get(url);
  data.results = data.results.map(
    (document) => new Document(document.document),
  );
  return new Results(url, data);
}

export async function addUserToProject(
  projectId,
  email,
  access,
  expand = DEFAULT_EXPAND,
) {
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

export async function updateUserAccess(projectId, userId, access) {
  await session.patch(apiUrl(`projects/${projectId}/users/${userId}/`), {
    access,
  });
}

export async function removeUser(projectId, userId) {
  await session.delete(apiUrl(`projects/${projectId}/users/${userId}/`));
}
