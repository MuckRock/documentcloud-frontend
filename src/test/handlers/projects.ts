import { rest } from "msw";
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
  info: rest.get(createApiUrl("projects/"), dataHandler(projectList)),
  data: rest.get(projectUrl, dataHandler(projectFixture)),
  empty: rest.get(projectUrl, emptyHandler(emptyList)),
  loading: rest.get(projectUrl, loadingHandler),
  error: rest.get(projectUrl, errorHandler),
  documents: rest.get(
    createApiUrl("projects/*/documents/"),
    pageHandler(projDocsPage1, projDocsPage2),
  ),
};
