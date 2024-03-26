import { generateGetHandler } from "./utils.js";
import { projectList } from "../fixtures/projects";

export const projects = generateGetHandler("projects/", projectList);
