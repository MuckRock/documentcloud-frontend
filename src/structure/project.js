import { Svue } from "svue";
import { uniquify } from "@/util/array.js";

const APP_URL = process.env.APP_URL;

export class Project extends Svue {
  constructor(rawProject, structure = {}) {
    const computed = structure.computed == null ? {} : structure.computed;
    super({
      data() {
        const data = structure.data == null ? {} : structure.data();
        data.project = rawProject;
        data.usersAndAccesses = [];
        return data;
      },
      computed: {
        ...computed,
        id(project) {
          return project.id;
        },
        slug(project) {
          return project.slug;
        },
        slugId(id, slug) {
          // Opposite order from docs (for legacy reasons)
          return [slug, id].join("-");
        },
        title(project) {
          return project.title;
        },
        description(project) {
          return project.description;
        },
        editAccess(project) {
          if (project.edit_access == null) return false;
          return project.edit_access;
        },
        addRemoveAccess(project, editAccess) {
          if (project.add_remove_access == null) return editAccess;
          return project.add_remove_access;
        },
        embedUrl(slugId) {
          return `${APP_URL}projects/${slugId}/`;
        },
      },
    });
  }

  addUser(user, access) {
    this.usersAndAccesses = uniquify(
      [...this.usersAndAccesses, { user, access }],
      (x) => x.user.id,
    );
  }

  removeUser(user) {
    this.usersAndAccesses = this.usersAndAccesses.filter(
      (x) => x.user.id != user.id,
    );
  }

  changeAccess(user, access) {
    this.usersAndAccesses = this.usersAndAccesses.map((x) => {
      if (x.user.id == user.id) {
        x.access = access;
      }
      return x;
    });
  }
}
