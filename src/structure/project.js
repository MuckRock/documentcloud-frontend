import { Svue } from 'svue';

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
        title(project) {
          return project.title;
        },
        collaborators(project) {
          return project.collaborators;
        },
        collaboratorCount(collaborators) {
          return collaborators.length;
        },
        accountName(project) {
          return project.account_full_name;
        },
        ownProject(collaboratorCount) {
          return collaboratorCount > 0;
        },
        documentCount(project) {
          return project.document_count;
        },
        annotationCount(project) {
          return project.annotation_count;
        }
      }
    });
  }
}
