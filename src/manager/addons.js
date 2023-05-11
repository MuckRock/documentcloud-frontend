import { Svue } from "svue";
import {
  getAddons,
  getActiveAddons,
  postAddonDispatch,
  getAddonRuns,
  activateAddon,
  updateAddonRun,
} from "@/api/addon.js";

export function done(run) {
  return run.status != "queued" && run.status != "in_progress";
}

export const addons = new Svue({
  data() {
    return {
      hasInited: false,
      activeAddons: [],
      browserAddons: [],
      browserNext: null,
      browserPrev: null,
      runs: [],
    };
  },
  computed: {
    addonsById(browserAddons, activeAddons) {
      return [...browserAddons, ...activeAddons].reduce((m, addon) => {
        m[addon.id] = addon;
        return m;
      }, {});
    },
    addonsByRepo(browserAddons, activeAddons) {
      return [...browserAddons, ...activeAddons].reduce((m, addon) => {
        m[addon.repository] = addon;
        return m;
      }, {});
    },
    pollEvents(runs) {
      if (runs.filter((x) => !done(x)).length === 0) return [];
      return [updateRuns];
    },
  },
});

export async function initAddons(me) {
  const newAddons = await getActiveAddons();
  addons.activeAddons = newAddons;

  updateRuns();
}

async function updateRuns() {
  const newRuns = await getAddonRuns();
  addons.runs = newRuns;
}

export async function dispatchAddon(
  addonId,
  userParameters,
  userActiveQuery,
  userSelected,
) {
  const addon = addons.addonsById[addonId];
  const response = await postAddonDispatch(
    addon,
    userParameters,
    userActiveQuery,
    userSelected,
  );
  addons.runs = [response, ...addons.runs];
  return response;
}

export function removeRun(uuid) {
  addons.runs = addons.runs.filter((addon) => addon.uuid != uuid);
}

export async function getBrowserAddons({
  query = "",
  filters = {},
  per_page = 5,
  url = null,
} = {}) {
  const newAddons = await getAddons({ query, filters, per_page, url });
  [addons.browserAddons, addons.browserNext, addons.browserPrev] = newAddons;
}

/**
 * Fetch a single Add-On based on repository name, like Muckrock/Klaxon
 *
 * @export
 * @param {string} [repo=""]
 * @returns import('../structure/addon').Addon
 */
export async function getAddonByRepository(repository = "") {
  const [addons, next, previous] = await getAddons({
    filters: { repository },
    per_page: 1,
  });
  return addons[0] || null; // there should be only one, or nothing
}

export async function toggleActiveAddon(addon) {
  // first call API to toggle the add-ons active state
  const newAddon = await activateAddon(addon.id, !addon.active);
  // then add or remove from the list of active add-ons
  if (newAddon.active) {
    addons.activeAddons = [...addons.activeAddons, newAddon];
  } else {
    addons.activeAddons = addons.activeAddons.filter((a) => a.id != addon.id);
  }
  // then update the state in the browser list
  addons.browserAddons = addons.browserAddons.map((a) =>
    a == addon ? newAddon : a,
  );
}

export async function editAddonRun(run, data) {
  const newRun = await updateAddonRun(run, data);
  addons.runs = addons.runs.map((r) => (r.uuid === newRun.uuid ? newRun : r));
}
