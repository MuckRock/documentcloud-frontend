/**
 * The most recent document browser query. Used to preserve
 * the query when navigating to add-on pages.
 *
 * Unlike SearchResultsState.query, which is reinitialized
 * after every navigation, this state persists across navigations.
 */

import type { AddOn } from "$lib/api/types";
import { APP_URL } from "@/config/embed";
import { createContext } from "svelte";

export class DocumentQueryState {
  query: string = $state("");

  getAddonLink({ repository, parameters }: AddOn): string {
    let path = `/add-ons/${repository}/`;
    let url = new URL(path, APP_URL);
    if (parameters.documents && this.query) {
      url.searchParams.set("q", this.query);
    }
    return url.toString();
  }
}

export const [getDocumentQuery, setDocumentQuery] =
  createContext<DocumentQueryState>();

export function initDocumentQueryState() {
  setDocumentQuery(new DocumentQueryState());
  return getDocumentQuery();
}
