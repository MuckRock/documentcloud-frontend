import { Svue } from "svue";
import {
  getProjects,
  newProject,
  updateProject,
  deleteProject,
  getProjectUsers,
  addUserToProject,
  updateUserAccess,
  removeUser,
} from "@/api/project";
import { Project } from "../structure/project.js";

import { layout } from "./layout.js";
import {
  addDocsToProject,
  removeDocsFromProject,
} from "@/manager/documents.js";
import { uniquify } from "@/util/array.js";

export const projects = new Svue({
  data() {
    return {
      projects: [],
      projectUsers: [],
    };
  },
  computed: {
    projectsById(projects) {
      const results = {};
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        results[project.id] = project;
      }
      return results;
    },
    addRemoveableProjects(projects) {
      return projects.filter((project) => project.addRemoveAccess);
    },
  },
});

function addUsers(...users) {
  const allUsers = projects.projectUsers.concat(users);
  projects.projectUsers = uniquify(allUsers);
}

export async function initProjects(me) {
  const newProjects = await getProjects(me.id);
  projects.projects = newProjects.map((project) => new Project(project));
}

export async function createNewProject(title, description) {
  const project = await newProject(title, description);
  projects.projects = [...projects.projects, new Project(project)];
}

export async function editProject(project, title, description) {
  const updatedProject = await updateProject(project.id, title, description);
  projects.projects = projects.projects.map((oldProject) => {
    if (project.id == oldProject.id) {
      return new Project(updatedProject);
    } else {
      return oldProject;
    }
  });
}

export async function addSelectedDocsToProject(project) {
  await addDocsToProject(project, layout.selected);
}

export async function removeSelectedDocsFromProject(project) {
  await removeDocsFromProject(project, layout.selected);
}

export function selectedDocsInProject(project) {
  // Abort early if project or docs are empty
  if (project == null) return "none";
  const docs = layout.selected;
  if (docs.length == 0) return "none";

  let atLeastOneDocInProject = false;
  let atLeastOneDocOutsideProject = false;
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    if (doc.projectIds.includes(project.id)) {
      atLeastOneDocInProject = true; // can only be partial or full
      if (atLeastOneDocOutsideProject) return "partially";
    } else {
      atLeastOneDocOutsideProject = true; // can only be partial or none
      if (atLeastOneDocInProject) return "partially";
    }
  }

  if (!atLeastOneDocOutsideProject) return "fully";
  if (!atLeastOneDocInProject) return "none";
  return "partially";
}

export async function removeProject(project) {
  await deleteProject(project.id);
  projects.projects = projects.projects.filter(
    (oldProject) => oldProject.id != project.id,
  );
}

export async function getProjUsers(project) {
  const userAccesses = await getProjectUsers(project.id);
  userAccesses.forEach((userAccess) =>
    project.addUser(userAccess.user, userAccess.access),
  );
  // Add to known list of all users
  addUsers(...userAccesses.map((userAccess) => userAccess.user));
  return userAccesses;
}

export async function addUser(project, email, access) {
  const userAccess = await addUserToProject(project.id, email, access);
  project.addUser(userAccess.user, userAccess.access);
  // Add to known list of all users
  addUsers(userAccess.user);
  return userAccess;
}

export async function changeUserAccess(project, user, access) {
  await updateUserAccess(project.id, user.id, access);
  project.changeAccess(user, access);
}

export async function removeUserFromProject(project, user) {
  await removeUser(project.id, user.id);
  project.removeUser(user);
}
