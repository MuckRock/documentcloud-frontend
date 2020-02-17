/**
 * Methods related to the DocumentCloud project API
 */

import session from "./session";
import { apiUrl } from "./base";
import { Project } from "@/structure/project";
import { grabAllPages } from "@/util/paginate";
import { DEFAULT_EXPAND } from "./common";
import { queryBuilder } from "@/util/url";

export async function newProject(title, description) {
  // Create a project
  const { data } = await session.post(apiUrl("projects/"), {
    title,
    description
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
    description
  });
  return new Project(data);
}

export async function addDocumentsToProject(projectId, docIds) {
  await session.post(
    apiUrl(`projects/${projectId}/documents/`),
    docIds.map(id => ({
      document: id
    }))
  );
}

export async function removeDocumentsFromProject(projectId, docIds) {
  await session.delete(
    apiUrl(`projects/${projectId}/documents/`),
    docIds.map(id => ({
      document: id
    }))
  );
}

export async function getProjects(expand = DEFAULT_EXPAND) {
  // Returns all projects
  const projects = await grabAllPages(
    queryBuilder(apiUrl("projects/"), { expand })
  );
  return projects.map(project => new Project(project));
}

export async function getUsers(projectId) {
  const results = await session.get(apiUrl(`projects/${projectId}/users/`));
  console.log(results);
  return results;
}

export async function addUserToProject(projectId, email, access) {
  await session.post(apiUrl(`projects/${projectId}/users/`), {
    email,
    access
  });
}

// export async function updateUserAccess(projectId, userId, access) {

// }
