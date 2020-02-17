import { Svue } from "svue";
import {
  getProjects,
  addDocumentsToProject,
  removeDocumentsFromProject,
  newProject,
  updateProject,
  deleteProject,
  getUsers,
  addUserToProject
} from "@/api/project";
import { router } from "@/router/router";
import { layout } from "./layout";
import { pushToast } from "./toast";
import { updateInCollection } from "@/manager/documents";
import { handlePlural } from "@/util/string";
import { removeFromArray } from "@/util/array";
import { wrapLoad } from "@/util/wrapLoad";

export const projects = new Svue({
  data() {
    return {
      projects: [],
      router
    };
  },
  watch: {
    router() {
      const route = router.resolvedRoute;
      if (route != null && route.name == "app") {
        initProjects();
      } else {
        this.projects = [];
      }
    }
  },
  computed: {
    projectsById(projects) {
      const results = {};
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        results[project.id] = project;
      }
      return results;
    }
  }
});

function initProjects() {
  getProjects().then(newProjects => {
    projects.projects = newProjects;
  });
}

export async function createNewProject(title, description) {
  const project = await newProject(title, description);
  projects.projects = [...projects.projects, project.id];
}

export async function editProject(project, title, description) {
  const updatedProject = await updateProject(project.id, title, description);
  projects.projects = projects.projects.map(oldProject => {
    if (project.id == oldProject.id) {
      return updatedProject;
    } else {
      return oldProject;
    }
  });
}

export async function addDocsToProject(project, documents) {
  if (documents.length == 0) return;
  await wrapLoad(layout, async () => {
    await addDocumentsToProject(
      project.id,
      documents.map(doc => doc.id)
    );
    documents.forEach(doc =>
      updateInCollection(
        doc,
        d => (d.doc = { ...d.doc, projects: [...d.projectIds, project.id] })
      )
    );
  });
  if (!layout.error) {
    pushToast(
      `Successfully added ${handlePlural(
        documents.length,
        "document",
        true
      )} to project (${project.title}).`
    );
  }
}

export async function removeDocsFromProject(project, documents) {
  if (documents.length == 0) return;
  await wrapLoad(layout, async () => {
    await removeDocumentsFromProject(
      project.id,
      documents.map(doc => doc.id)
    );
    documents.forEach(doc =>
      updateInCollection(
        doc,
        d =>
          (d.doc = {
            ...d.doc,
            projects: removeFromArray(d.projectIds, project.id)
          })
      )
    );
  });
  if (!layout.error) {
    pushToast(
      `Successfully removed ${handlePlural(
        documents.length,
        "document",
        true
      )} from project (${project.title}).`
    );
  }
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
    oldProject => oldProject.id != project.id
  );
}

export async function getProjectUsers(project) {
  return await getUsers(project.id);
}

export async function addUser(project, email, access) {
  return await addUserToProject(project.id, email, access);
}
