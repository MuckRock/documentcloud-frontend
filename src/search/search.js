import { Svue } from "svue";
import { router, getPath } from "@/router/router";
import { wrapSeparate } from "@/util/wrapLoad";
import { layout } from "@/manager/layout";
import { SearchParams } from "@/structure/searchParams";
import { pushUrl } from "@/router/router";
import { queryBuilder } from "@/util/url";
import { slugify } from "@/util/string";
import { modifications } from "@/manager/modifications";
import { Results } from '@/structure/results';

const TAG_KEY = process.env.TAG_KEY;

export const search = new Svue({
  data() {
    return {
      router,
      params: null,
      results: null
    };
  },
  watch: {
    "router.resolvedRoute"() {
      const route = router.resolvedRoute;
      if (route != null && (route.name == "app" || route.name == 'project') && router.backNav != true) {
        initSearch(route.props);
      }
    }
  },
  computed: {
    documents(hasResults, results) {
      if (!hasResults) return [];
      return results.results;
    },
    hasResults(results) {
      return results != null && results.results != null;
    }
  }
});

async function initSearch(params) {
  search.params = new SearchParams(params);

  // Get results
  if (search.params.getMethod != null) {
    const results = await wrapSeparate(layout, search, search.params.getMethod[0]);
    search.results = results;
    console.log("SR", search.results);
    const filter = search.params.getMethod[1];
    if (filter != null) {
      modifications.applyModifications();
      filterDocuments(filter);
    } else {
      // Force an update
      search.results = search.results;
    }
  }
}

function filterDocuments(filter) {
  setDocuments(search.documents.filter(filter));
}

export function setDocuments(documents) {
  const results = search.results == null ? new Results('', { count: 0, results: [] }) : search.results;
  results.rawResults = {
    ...(results.rawResults == null ? {} : results.rawResults),
    results: documents
  };
  search.results = results;
}

export function handleUpload(newDocs) {
  // Handle upload redirect behavior
  setDocuments([...newDocs, ...search.documents]);
}

export function allDocumentsUrl() {
  return searchUrl("");
}

export function projectUrl(project) {
  return searchUrl(
    `project:${slugify(project.title, project.id)} `
  );
}

export function projectIdUrl(projectId) {
  return searchUrl(
    `project:${projectId} `
  );
}

export function userOrgUrl(obj, key, publicAccessOnly = false) {
  const access = publicAccessOnly ? "access:public " : "";
  return searchUrl(
    `${key}:${slugify(obj.name, obj.id)} ${access}`,
  );
}

export function userUrl(user, publicAccessOnly = false) {
  return userOrgUrl(user, "user", publicAccessOnly);
}

export function escapeValue(value) {
  // Properly escapes a value by placing it inside quotes and escaping quote characters
  return `"${value.replace('"', '\\"')}"`;
}

export function dataUrl(key, value) {
  // TODO: ensure data query is escaped properly
  const dataQuery = `${key == TAG_KEY ? 'tag' : `data_${key}`}:${escapeValue(value)}`;
  return searchUrl(dataQuery);
}

export function orgUrl(organization) {
  return userOrgUrl(organization, "organization");
}

export function searchUrl(query) {
  return queryBuilder(getPath('app'), {
    q: query,
    page: null
  });
}

export function handleSearch(query) {
  pushUrl(searchUrl(query));
}
