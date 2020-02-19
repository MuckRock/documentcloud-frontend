import { Svue } from "svue";
import { router } from "@/router/router";
import { wrapSeparate } from "@/util/wrapLoad";
import { layout } from "@/manager/layout";
import { SearchParams } from "@/structure/searchParams";
import { pushUrl } from "@/router/router";
import { queryBuilder } from "@/util/url";

export const search = new Svue({
  data() {
    return {
      router,
      results: null,
      isSearch: false
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
  params = new SearchParams(params);

  // Get results
  search.isSearch = params.isSearch;
  const results = await wrapSeparate(layout, search, params.getMethod);
  search.results = results;
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

export function handleSearch(query) {
  query = query.trim();
  pushUrl(
    queryBuilder(null, { q: query.length > 0 ? query : null, page: null })
  );
}
