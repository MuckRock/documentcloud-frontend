import { Svue } from "svue";
import { router, getPath } from "@/router/router.js";
import { wrapSeparate } from "@/util/wrapLoad.js";
import { layout } from "@/manager/layout.js";
import { SearchParams } from "@/structure/searchParams.js";
import { pushUrl } from "@/router/router.js";
import { queryBuilder } from "@/util/url.js";
import { slugify } from "@/util/string.js";
import { modifications } from "@/manager/modifications.js";
import { Results } from "@/structure/results.js";
import { apiSearchUrl, searchDocumentsUrl } from "@/api/document.js";
import deepEqual from "fast-deep-equal";
import { _ } from "@/langs/i18n.js";

import { TAG_KEY } from "../config/config.js";

let lastSearch = null;

export const search = new Svue({
  data() {
    return {
      router,
      params: null,
      results: null,
      filePickerUser: null,
      prevUrls: [],
      currentUrl: null,
      _,
    };
  },
  watch: {
    "router.resolvedRoute"() {
      checkForInit();
    },
    filePickerUser() {
      checkForInit();
    },
    _() {
      // Force results update
      this.results = this.results;
    },
  },
  computed: {
    onlyShowSuccessfulStatuses(filePickerUser, router) {
      // Applies when in embed or dialog
      const route = router.resolvedRoute;
      if (filePickerUser != null) return true;
      if (route != null && route.name == "project") return true;
      return false;
    },
    documents(hasResults, results) {
      if (!hasResults) return [];
      return results.results;
    },
    hasResults(results) {
      return results != null && results.results != null;
    },
    hasNext(results, params) {
      if (results == null) return false;
      return results.hasNext && results.length == params.perPage;
    },
    hasPrev(prevUrls) {
      return prevUrls.length > 0;
    },
    page(prevUrls) {
      return prevUrls.length;
    },
    start(prevUrls, results, params) {
      if (results == null) return 0;
      var startIndex = 1;
      if (Array.isArray(prevUrls) && params && !isNaN(params.perPage)) {
        startIndex += prevUrls.length * params.perPage;
      }
      return startIndex;
    },
    end(start, results) {
      if (results == null) return 0;
      return start + results.length - 1;
    },
  },
});

export async function initSearch(params) {
  search.params = new SearchParams(params, search.onlyShowSuccessfulStatuses);
  search.prevUrls = [];
  search.currentUrl = apiSearchUrl(search.params.query);

  // Get results
  if (search.params.getMethod != null) {
    const results = await wrapSeparate(
      layout,
      search,
      search.params.getMethod[0],
    );
    search.results = results;
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

export async function searchNext() {
  // Initialize the search for the next page
  search.prevUrls.push(search.currentUrl);
  search.prevUrls = search.prevUrls;
  search.currentUrl = search.results.nextUrl;
  search.results = await wrapSeparate(layout, search, () =>
    searchDocumentsUrl(search.currentUrl),
  );
}

export async function searchPrev() {
  // Initialize the search for the previous page
  search.currentUrl = search.prevUrls.pop();
  search.prevUrls = search.prevUrls;
  if (search.results.hasPrev) {
    // If using the project API for project embeds, we will have a previous URL
    // We use it, as otherwise the first URL will incorrectly be a search URL
    // instead of a project URL
    search.currentUrl = search.results.prevUrl;
  }
  search.results = await wrapSeparate(layout, search, () =>
    searchDocumentsUrl(search.currentUrl),
  );
}

function checkForInit() {
  const route = router.resolvedRoute;

  // Prevent repeated searches
  const searchCache = [
    route != null && route.name,
    route != null && search.filePickerUser,
    route != null && route.props,
  ];
  if (lastSearch != null && deepEqual(searchCache, lastSearch)) return;
  lastSearch = searchCache;

  if (
    route != null &&
    (((route.name == "app" || route.name == "project") &&
      router.backNav != true) ||
      search.filePickerUser != null)
  ) {
    initSearch(
      search.filePickerUser != null
        ? { q: userSearchQuery(search.filePickerUser) }
        : route.props,
    );
  }
}

function filterDocuments(filter) {
  setDocuments(search.documents.filter(filter));
}

export function setDocuments(documents) {
  const results =
    search.results == null
      ? new Results("", { count: 0, results: [] })
      : search.results;
  results.rawResults = {
    ...(results.rawResults == null ? {} : results.rawResults),
    results: documents,
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
  return searchUrl(`+project:${slugify(project.title, project.id)} `);
}

export function projectIdUrl(projectId) {
  return searchUrl(`+project:${projectId} `);
}

export function userOrgUrl(obj, key, options = {}) {
  const access = options?.access ? `+access:${options.access} ` : "";
  return searchUrl(`+${key}:${slugify(obj.name, obj.id)} ${access}`);
}

export function userUrl(user, options) {
  return userOrgUrl(user, "user", options);
}

export function userSearchQuery(user) {
  return `user:${slugify(user.name, user.id)} `;
}

export function escapeValue(value) {
  // Properly escapes a value by placing it inside quotes and escaping quote characters
  return `"${value.replace('"', '\\"')}"`;
}

export function dataUrl(key, value) {
  // TODO: ensure data query is escaped properly
  const dataQuery = `+${key == TAG_KEY ? "tag" : `data_${key}`}:${escapeValue(
    value,
  )}`;
  return searchUrl(dataQuery);
}

export function orgUrl(organization) {
  return userOrgUrl(organization, "organization");
}

export function searchUrl(query) {
  return queryBuilder(getPath("app"), {
    q: query,
    cursor: null,
  });
}

export function handleSearch(query, urlPush = true) {
  if (urlPush) {
    // The default way to search: the URL is pushed and the search updates
    // based on its value
    pushUrl(searchUrl(query));
  } else {
    // Searching in dialogs and contexts where the URL should stay intact
    initSearch({ q: query });
  }
}
