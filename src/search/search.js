import { Svue } from "svue";
import { router } from "@/router/router";
import { wrapSeparate } from "@/util/wrapLoad";
import { layout } from "@/manager/layout";
import { SearchParams } from "@/structure/searchParams";
import { pushUrl } from "@/router/router";
import { queryBuilder } from "@/util/url";
import { slugify } from "@/util/string";

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
      if (route != null && route.name == "app") {
        initSearch(route.props);
      } else {
        // TODO
      }
    }
  },
  computed: {
    documents(hasResults, results) {
      if (!hasResults) return [];
      return results.results;
    },
    hasResults(results) {
      return results != null;
    }
  }
});

async function initSearch(params) {
  search.params = new SearchParams(params);

  // Get results
  if (search.params.getMethod != null) {
    const results = await wrapSeparate(layout, search, search.params.getMethod);
    search.results = results;
  }
}

export function setDocuments(documents) {
  search.results.rawResults = {
    ...search.results.rawResults,
    results: documents
  };
  search.results = search.results;
}

export function handleUpload(newDocs) {
  // Handle upload redirect behavior
  setDocuments([...newDocs, ...search.documents]);
}

export function allDocumentsUrl() {
  return searchUrl("", "");
}

export function projectUrl(project) {
  return searchUrl(
    `project:${slugify(project.title, project.id)} `,
    `projects:${project.id} `
  );
}

export function userOrgUrl(obj, key, publicAccessOnly = false) {
  const access = publicAccessOnly ? "access:public " : "";
  return searchUrl(
    `${key}:${slugify(obj.name, obj.id)} ${access}`,
    `${key}:${obj.id} ${access}`
  );
}

export function userUrl(user, publicAccessOnly = false) {
  return userOrgUrl(user, "user", publicAccessOnly);
}

export function dataUrl(key, value) {
  // TODO: ensure data query is escaped properly
  const dataQuery = `data_${key}:"${value}"`;
  return searchUrl(dataQuery, dataQuery);
}

export function orgUrl(organization) {
  return userOrgUrl(organization, "organization");
}

export function searchUrl(query, transformedQuery) {
  const q =
    transformedQuery != null && transformedQuery.length > 0
      ? transformedQuery
      : transformedQuery == null
        ? null
        : "";

  return queryBuilder(null, {
    q,
    // Display query
    dq: query,
    page: null
  });
}

export function handleSearch(query, transformedQuery) {
  pushUrl(searchUrl(query, transformedQuery));
}
