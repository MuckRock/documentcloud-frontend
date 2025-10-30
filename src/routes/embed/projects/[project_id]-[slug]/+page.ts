// load data for project embeds
import type { Maybe } from "$lib/api/types";

import { error, redirect } from "@sveltejs/kit";

import { EMBED_MAX_AGE } from "@/config/config.js";
import { search } from "$lib/api/documents";
import { get, embedUrl } from "$lib/api/projects";

const OLD_PATTERN = /(\D+)-(\d+)/;

export async function load({ params, fetch, url, setHeaders }) {
  let { project_id, slug }: Record<string, Maybe<string>> = params;
  let project = await get(+project_id, fetch);

  // old project embeds used a pattern of <slug>-<id>
  // so we want to give 404s a chance to try again
  if (project.error) {
    // try again with IDs switched
    if (
      project.error.status === 404 &&
      `${project_id}-${slug}`.match(OLD_PATTERN)
    ) {
      const groups = OLD_PATTERN.exec(`${project_id}-${slug}`);
      project_id = groups?.[2]!;
      const retry = await get(+project_id, fetch);
      if (retry.data) {
        project = retry;
      }
    } else {
      return error(project.error.status, project.error.message);
    }
  }

  if (!project.data) {
    return error(404, "Project not found");
  }

  const documents = search(`+project:${project_id}`, undefined, fetch);

  if (url.pathname !== embedUrl(project.data).pathname) {
    return redirect(302, embedUrl(project.data));
  }

  setHeaders({
    "Cloudflare-CDN-Cache-Control": `public, max-age=${EMBED_MAX_AGE}`,
    "last-modified": new Date(project.data.updated_at).toUTCString(),
  });

  return {
    documents,
    error: project.error,
    project: project.data,
  };
}
