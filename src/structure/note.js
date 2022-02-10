import { Svue } from "svue";
import { ensureBounds } from "@/util/bounds";

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
          return note.x1 === null;
        },
        x1(note) {
          if (note.x1 === null) return null;
          return ensureBounds(Math.min(note.x1, note.x2));
        },
        x2(note) {
          if (note.x2 === null) return null;
          return ensureBounds(Math.max(note.x1, note.x2));
        },
        y1(note) {
          if (note.y1 === null) return null;
          return ensureBounds(Math.min(note.y1, note.y2));
        },
        y2(note) {
          if (note.y2 === null) return null;
          return ensureBounds(Math.max(note.y2, note.y2));
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
        },
      },
    });
  }
}
