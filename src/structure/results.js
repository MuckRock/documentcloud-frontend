import { Svue } from "svue";
import { queryBuilder } from "@/util/url";

const pageRe = /([&\?]page=)([0-9]+)/;

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
        page(hasNext, hasPrev, nextUrl, prevUrl) {
          // On the first and only page
          if (!hasNext && !hasPrev) return 0;

          if (hasNext) {
            // Base current page off next page
            const match = nextUrl.match(pageRe);
            if (match == null) throw new Error("This should not happen");
            const number = parseInt(match[2]) - 1;
            return number - 1; // page before next
          } else if (hasPrev) {
            const match = prevUrl.match(pageRe);
            if (match == null) {
              // If the previous url doesn't match the regex, we are on the
              // second page, since only the first page won't match.
              return 1;
            }
            const number = parseInt(match[2]) - 1;
            return number + 1; // page after previous
          }
        },
        numPages(count, length, page, hasNext) {
          if (!hasNext) return page + 1; // we are on the last page
          return Math.ceil(count / length);
        },
        perPage(count, length, page, numPages) {
          if (numPages == 1) return count;
          if (page < numPages - 1) return length;
          return (count - length) / (numPages - 1);
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
        nextPage(hasNext, page) {
          if (!hasNext) return null;
          return page + 1;
        },
        prevPage(hasPrev, page) {
          if (!hasPrev) return null;
          return page - 1;
        },
        onlyPage(hasPrev, hasNext) {
          return !hasPrev && !hasNext;
        },

        // Indices
        start(page, perPage) {
          return page * perPage;
        },
        end(page, perPage, length) {
          return page * perPage + length;
        },
      },
    });
  }

  getUrl(page) {
    const match = this.url.match(pageRe);
    if (match == null) return queryBuilder(this.url, { page: page + 1 });
    return this.url.replace(pageRe, `$1${page + 1}`);
  }
}
