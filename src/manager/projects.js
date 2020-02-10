import { Svue } from "svue";
import { getProjects, addDocToProject } from "@/api/project";
import { router } from "@/router/router";
import { newProject, updateProject, deleteProject } from "@/api/project";
import { layout } from "./layout";
import { pushToast } from "./toast";
import { wrapMultiple } from "@/util/wrapLoad";
import { handlePlural } from "@/util/string";

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
  }
});

function initProjects() {
  getProjects().then(newProjects => {
    projects.projects = newProjects;
  });
}

export async function createNewProject(title, description) {
  const project = await newProject(title, description);
  projects.projects = [...projects.projects, project];
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
  await wrapMultiple(
    layout,
    ...documents.map(doc => async () => {
      await addDocToProject(project.id, doc.id);
    })
  );
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

export async function addSelectedDocsToProject(project) {
  await addDocsToProject(project, layout.selected);
}

export async function removeProject(project) {
  await deleteProject(project.id);
  projects.projects = projects.projects.filter(
    oldProject => oldProject.id != project.id
  );
}
