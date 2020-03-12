import { Svue } from "svue";
import { uniquify } from "@/util/array";

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
        title(project) {
          return project.title;
        },
        description(project) {
          return project.description;
        },
        editAccess(project) {
          if (project.edit_access == null) return false;
          return project.edit_access;
        }
      }
    });
  }

  addUser(user, access) {
    this.usersAndAccesses = uniquify(
      [...this.usersAndAccesses, { user, access }],
      x => x.user.id
    );
  }

  removeUser(user) {
    this.usersAndAccesses = this.usersAndAccesses.filter(
      x => x.user.id != user.id
    );
  }

  changeAccess(user, access) {
    this.usersAndAccesses = this.usersAndAccesses.map(x => {
      if (x.user.id == user.id) {
        x.access = access;
      }
      return x;
    });
  }
}
