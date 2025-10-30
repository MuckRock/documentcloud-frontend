import type { Page } from "$lib/api/types";

import { http } from "msw";

import {
  dataHandler,
  emptyHandler,
  errorHandler,
  loadingHandler,
  createApiUrl,
  pageHandler,
} from "./utils";

import { emptyList } from "../fixtures/common";
import { projectList } from "../fixtures/projects";
import projectFixture from "../fixtures/projects/project.json";
import projDocsPage1 from "../fixtures/projects/project-documents-expanded.json";
import projDocsPage2 from "../fixtures/projects/project-documents-2.json";

const projectUrl = createApiUrl("projects/*");

export const projects = {
  info: http.get(createApiUrl("projects/"), dataHandler(projectList)),
  data: http.get(projectUrl, dataHandler(projectFixture)),
  empty: http.get(projectUrl, emptyHandler(emptyList)),
  loading: http.get(projectUrl, loadingHandler),
  error: http.get(projectUrl, errorHandler),
  documents: http.get(
    createApiUrl("projects/*/documents/"),
    pageHandler<Page<{ document: Partial<Document> }>>(
      projDocsPage1,
      projDocsPage2,
    ),
  ),
};
