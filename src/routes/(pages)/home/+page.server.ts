// load homepage data

import { PAGE_MAX_AGE } from "@/config/config.js";
import { getMe } from "$lib/api/accounts";
import { search } from "$lib/api/documents.js";

export const trailingSlash = "ignore";

export async function load({ fetch, cookies, setHeaders }) {
  const sessionId = cookies.get("sessionid");
  const me = sessionId ? await getMe(fetch) : null;

  const { data } = await search("", { per_page: 1 });
  const featuredProjects = [
    {
      title: "Trump pardons",
      link: "https://www.documentcloud.org/projects/221636-trump-pardons/",
    },
    {
      title: "Exposed: The Human Radiation Experiments at Hunters Point",
      link: "https://www.documentcloud.org/projects/203581-exposed/",
    },
    {
      title: "Archive of inspector general reports",
      link: "https://www.documentcloud.org/projects/221213-archive-of-inspector-general-reports/",
    },
    {
      title: "West Lake Landfill project",
      link: "https://www.documentcloud.org/projects/214065-west-lake-landfill-project/",
    },
  ];

  if (!me) {
    setHeaders({
      "cache-control": `public, max-age=${PAGE_MAX_AGE}`,
    });
  }

  return {
    title: "Home",
    documentCount: data?.count,
    featuredProjects,
    me,
  };
}
