/**
 * Methods related to the DocumentCloud project API
 */

import session from "./session";
import { apiUrl } from "./base";
import { Project } from "@/structure/project";
import { grabAllPages, MAX_PER_PAGE } from "@/util/paginate";
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

export async function getProjects(expand = DEFAULT_EXPAND) {
  // Returns all projects
  const projects = await grabAllPages(
    queryBuilder(apiUrl("projects/"), { expand }),
    MAX_PER_PAGE
  );
  return projects.map(project => new Project(project));
}
