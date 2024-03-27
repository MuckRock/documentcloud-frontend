import { generateGetHandler } from "./utils";
import { projectList } from "../fixtures/projects";

export const projects = generateGetHandler("projects/", projectList);
