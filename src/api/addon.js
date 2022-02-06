/**
 * Methods related to the DocumentCloud note API
 */

import session from "./session";
import { Addon } from "@/structure/addon";
import { apiUrl } from "./base";
import { queryBuilder } from "@/util/url";
import { grabAllPages } from "@/util/paginate";
import { DEFAULT_EXPAND } from "./common";

export async function getAddons(id, expand = DEFAULT_EXPAND, page) {
  // Returns addons for the specified document at the specified page
  const results = await grabAllPages(
    apiUrl(
      queryBuilder(`plugins`, { expand, page_number: page }),
    ),
  );
  return results.map((result) => new Addon(result));
}

export async function getAddon(addonId) {
  // Get the note with the specified id
  const { data } = await session.get(
    apiUrl(`plugins/${addonId}/`),
  );
  return new Addon(data);
}

export async function postAddonDispatch(addonId, addonParameters, ids) {
  // Dispatch the addon for the specified document ids with the parameters fulfilled by the user
  await session.post(
    apiUrl(`plugins/${addonId}/dispatch/`), {
    parameters: addonParameters,
    documents: ids.map((id) =>  parseInt(id.id,10) )
  }
  );

}