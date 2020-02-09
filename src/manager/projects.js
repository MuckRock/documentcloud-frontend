import { Svue } from "svue";
import { getProjects } from "@/api/project";
import { router } from "@/router/router";
import { newProject, updateProject, deleteProject } from "@/api/project";

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

export async function removeProject(project) {
  await deleteProject(project.id);
  projects.projects = projects.projects.filter(
    oldProject => oldProject.id != project.id
  );
}
