import { Svue } from "svue";
import { DEFAULT_ORDERING } from "@/api/common";
import { getDocuments, searchDocuments } from "@/api/document";

export class SearchParams extends Svue {
  constructor(rawParams, structure = {}) {
    const computed = structure.computed == null ? {} : structure.computed;
    super({
      data() {
        const data = structure.data == null ? {} : structure.data();
        data.params = rawParams;
        return data;
      },
      computed: {
        ...computed,
        page(params) {
          const page = params.page == null ? 1 : parseInt(params.page);
          return page - 1;
        },
        query(params) {
          const query = params.q == null ? null : params.q.trim();
          return query != null && query.length > 0 ? query : null;
        },
        isSearch(query) {
          return query != null;
        },
        getMethod(query, page) {
          if (query != null) {
            // Use search method
            return () => searchDocuments(query, page);
          } else {
            // Use get documents method
            return () => getDocuments(null, DEFAULT_ORDERING, page);
          }
        }
      }
    });
  }
}
