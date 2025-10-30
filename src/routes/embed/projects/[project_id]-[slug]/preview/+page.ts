import { error, redirect } from "@sveltejs/kit";

import { EMBED_MAX_AGE } from "@/config/config.js";
import { get } from "$lib/api/projects";

export async function load({ params, fetch, url, setHeaders }) {
  let { project_id } = params;
  let project = await get(+project_id, fetch);

  if (project.error) {
    return error(project.error.status, project.error.message);
  }

  if (!project.data) {
    return error(404, "Project not found");
  }

  setHeaders({
    "Cloudflare-CDN-Cache-Control": `public, max-age=${EMBED_MAX_AGE}`,
    "last-modified": new Date(project.data.updated_at).toUTCString(),
  });

  return {
    project: project.data,
  };
}
