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
  const results = await wrapSeparate(layout, search, search.params.getMethod);
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

export function handleSearch(query, transformedQuery) {
  const q =
    transformedQuery != null && transformedQuery.length > 0
      ? transformedQuery
      : null;

  pushUrl(
    queryBuilder(null, {
      q,
      // Display query
      dq: query,
      page: null
    })
  );
}
