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
        actualPage(page) {
          // 0-based page number
          return page - 1;
        },
        title(section) {
          return section.title;
        }
      }
    });
  }
}
