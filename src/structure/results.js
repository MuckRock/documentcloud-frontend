import { Svue } from "svue";
import { queryBuilder } from "@/util/url";

export class Results extends Svue {
  constructor(url, rawResults, structure = {}) {
    const computed = structure.computed == null ? {} : structure.computed;
    super({
      data() {
        const data = structure.data == null ? {} : structure.data();
        data.rawResults = rawResults;
        data.url = url;
        return data;
      },
      computed: {
        ...computed,
        count(rawResults) {
          // Count of all results across pages
          return rawResults.count;
        },
        results(rawResults) {
          return rawResults.results;
        },
        length(results) {
          // Count of results for current page
          return results.length;
        },
        numPages(count, length) {
          return Math.ceil(count / length);
        },
        // Next / previous
        nextUrl(rawResults) {
          return rawResults.next;
        },
        prevUrl(rawResults) {
          return rawResults.previous;
        },
        hasNext(nextUrl) {
          return nextUrl != null;
        },
        hasPrev(prevUrl) {
          return prevUrl != null;
        },
      },
    });
  }
}
