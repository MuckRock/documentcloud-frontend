/**
 * Methods related to the DocumentCloud section API
 */

import session from "./session.js";
import { apiUrl } from "./base.js";
import { Section } from "@/structure/section.js";
import { grabAllPages } from "@/util/paginate.js";

export async function addSection(docId, page_number, title) {
  // Create a section
  const { data } = await session.post(apiUrl(`documents/${docId}/sections/`), {
    page_number,
    title,
  });
  return new Section(data);
}

export async function removeSection(docId, sectionId) {
  // Delete the section with the specified id
  await session.delete(apiUrl(`documents/${docId}/sections/${sectionId}/`));
}

export async function replaceSection(docId, sectionId, page_number, title) {
  // Replace a section
  const { data } = await session.put(
    apiUrl(`documents/${docId}/sections/${sectionId}/`),
    {
      page_number,
      title,
    },
  );
  return new Section(data);
}

export async function getSections(docId) {
  // Returns annotations for the specified document
  const sections = await grabAllPages(apiUrl(`documents/${docId}/sections/`));
  return sections.map((section) => new Section(section));
}
