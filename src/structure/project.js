import { Svue } from "svue";

export class Project extends Svue {
  constructor(rawProject, structure = {}) {
    const computed = structure.computed == null ? {} : structure.computed;
    super({
      data() {
        const data = structure.data == null ? {} : structure.data();
        data.project = rawProject;
        return data;
      },
      computed: {
        ...computed,
        id(project) {
          return project.id;
        },
        title(project) {
          return project.title;
        },
        description(project) {
          return project.description;
        }
      }
    });
  }
}
