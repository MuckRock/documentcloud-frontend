import { rest } from "msw";
import {
  dataHandler,
  emptyHandler,
  errorHandler,
  loadingHandler,
  createApiUrl,
} from "./utils";
import { projectList } from "../fixtures/projects";
import { emptyList } from "../fixtures/common";

const projectsUrl = createApiUrl("projects/*");
export const projects = {
  data: rest.get(projectsUrl, dataHandler(projectList)),
  empty: rest.get(projectsUrl, emptyHandler(emptyList)),
  loading: rest.get(projectsUrl, loadingHandler),
  error: rest.get(projectsUrl, errorHandler),
};
