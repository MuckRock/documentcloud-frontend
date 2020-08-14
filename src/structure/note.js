import { Svue } from "svue";

function getDefault(obj, defaultValue = "") {
  if (obj == null) return defaultValue;
  return obj;
}

export class Note extends Svue {
  constructor(rawNote, structure = {}) {
    const computed = structure.computed == null ? {} : structure.computed;
    super({
      data() {
        const data = structure.data == null ? {} : structure.data();
        data.note = rawNote;
        return data;
      },
      computed: {
        ...computed,
        id(note) {
          return note.id;
        },
        title(note) {
          return getDefault(note.title);
        },
        content(note) {
          return getDefault(note.content);
        },
        access(note) {
          return getDefault(note.access, "private");
        },
        page(note) {
          return note.page_number;
        },
        isPageNote(note) {
          return note.x1 == null;
        },
        x1(note) {
          return note.x1;
        },
        x2(note) {
          return note.x2;
        },
        y1(note) {
          return note.y1;
        },
        y2(note) {
          return note.y2;
        },
        width(x1, x2) {
          return x2 - x1;
        },
        height(y1, y2) {
          return y2 - y1;
        },
        username(note) {
          return getDefault(note.user, { name: "" }).name;
        },
        organization(note) {
          const org = getDefault(note.organization, {});
          if (org.individual) return null;
          return org.name;
        }
      }
    });
  }
}
