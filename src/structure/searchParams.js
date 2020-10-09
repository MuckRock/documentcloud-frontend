import { Svue } from "svue";
import { searchDocuments } from "@/api/document";
import { cacheAsync } from '@/util/cache';
import { highlight } from "@/search/parse";

const searchDocumentsCached = cacheAsync(searchDocuments);

const GET_DOCUMENT_FIELDS = {
  "project:": {
    idType: true
  },
  "projects:": {
    transform: "project",
    idType: true
  },
  "user:": {
    idType: true
  },
  "account:": {
    transform: "user",
    idType: true
  },
  "organization:": {
    idType: true
  },
  "group:": {
    transform: "organization",
    idType: true
  },
  "document:": {
    idType: true
  },
  "id:": {
    transform: "document",
    idType: true
  },
  "access:": {
    accept: ["public", "organization", "private"]
  },
  "status:": {
    accept: ["success", "readable", "pending", "error", "nofile"]
  }
};

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
          const query = params.q == null ? null : params.q;
          return query;
        },
        parsedQuery(query) {
          if (query == null) return null;
          return highlight(query);
        },
        getDocumentParams(parsedQuery) {
          const params = {};
          if (parsedQuery != null) {
            for (let i = 0; i < parsedQuery.length; i++) {
              const highlight = parsedQuery[i];
              if (highlight.type == "raw") {
                // Raw text has to be empty (e.g. spaces only)
                if (highlight.text.trim().length != 0) return null;
              }

              if (highlight.type == "field") {
                const getDocumentField = GET_DOCUMENT_FIELDS[highlight.field];
                if (getDocumentField == null) return null;

                let normalizedValue = null;
                if (getDocumentField.idType) {
                  // Ensure the value is an integer ID
                  const parts = highlight.value.split('-');
                  if (parts.length == 0) return null;
                  const lastPart = parts[parts.length - 1];
                  if (!/^[0-9]+$/.test(lastPart)) return null;
                  normalizedValue = parseInt(lastPart);
                } else {
                  // Ensure the value matches the accepted values
                  if (!getDocumentField.accept.includes(highlight.value))
                    return null;
                  normalizedValue = highlight.value;
                }

                const normalizedField =
                  getDocumentField.transform != null
                    ? getDocumentField.transform
                    : highlight.field.substr(0, highlight.field.length - 1);

                if (params[normalizedField] == null) {
                  // Create array for params if it does not already exist
                  params[normalizedField] = [normalizedValue];
                } else {
                  params[normalizedField].push(normalizedValue);
                }
              }
            }
          }
          return params;
        },
        oneUserSearch(getDocumentParams) {
          if (getDocumentParams == null) return null;
          if (
            getDocumentParams["project"] != null ||
            getDocumentParams["organization"] != null
          )
            return null;
          if (
            getDocumentParams["user"] == null ||
            getDocumentParams["user"].length != 1
          )
            return null;
          return getDocumentParams["user"][0];
        },
        oneOrgSearch(getDocumentParams) {
          if (getDocumentParams == null) return null;
          if (
            getDocumentParams["project"] != null ||
            getDocumentParams["user"] != null
          )
            return null;
          if (
            getDocumentParams["organization"] == null ||
            getDocumentParams["organization"].length != 1
          )
            return null;
          return getDocumentParams["organization"][0];
        },
        oneProjectSearch(getDocumentParams) {
          if (getDocumentParams == null) return null;
          if (
            getDocumentParams["user"] != null ||
            getDocumentParams["organization"] != null
          )
            return null;
          if (
            getDocumentParams["project"] == null ||
            getDocumentParams["project"].length != 1
          )
            return null;
          return getDocumentParams["project"][0];
        },
        oneAccessSearch(getDocumentParams) {
          if (getDocumentParams == null) return null;
          if (
            getDocumentParams["access"] == null ||
            getDocumentParams["access"].length != 1
          ) {
            return null;
          }
          return getDocumentParams["access"][0];
        },
        noStatus(getDocumentParams) {
          return (
            getDocumentParams == null || getDocumentParams["status"] == null
          );
        },
        oneOrZeroAccesses(getDocumentParams) {
          return (
            getDocumentParams == null ||
            getDocumentParams["access"] == null ||
            getDocumentParams["access"].length <= 1
          );
        },
        isAllSearch(getDocumentParams) {
          if (getDocumentParams == null) return false;
          if (
            getDocumentParams["user"] != null ||
            getDocumentParams["organization"] != null ||
            getDocumentParams["project"] != null
          ) {
            return false;
          }
          return true;
        },

        getMethod(query, page, oneUserSearch, oneProjectSearch, oneAccessSearch) {
          if (query == null) return null;  // Wait for redirect
          // Use search method
          if (page == 0) {
            // Investigate whether it's a cacheable search
            const cachedFn = () => searchDocumentsCached(query, page);
            if (oneUserSearch != null) {
              return [cachedFn, doc => doc.userId == oneUserSearch];
            }
            if (oneProjectSearch != null) {
              return [cachedFn, doc => doc.projectIds.includes(oneProjectSearch)];
            }
            if (oneAccessSearch != null) {
              return [cachedFn, doc => doc.access == oneAccessSearch];
            }
          }

          return [() => searchDocuments(query, page), null];
        }
      }
    });
  }
}
