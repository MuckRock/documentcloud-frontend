import { Svue } from "svue";

export class Section extends Svue {
  constructor(rawSection, structure = {}) {
    const computed = structure.computed == null ? {} : structure.computed;
    super({
      data() {
        const data = structure.data == null ? {} : structure.data();
        data.section = rawSection;
        return data;
      },
      computed: {
        ...computed,
        id(section) {
          return section.id;
        },
        page(section) {
          return section.page_number;
        },
        title(section) {
          return section.title;
        }
      }
    });
  }
}
