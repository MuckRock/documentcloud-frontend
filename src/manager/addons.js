import { Svue } from "svue";
import {
  getAddons,
  getActiveAddons,
  postAddonDispatch,
  getAddonRuns,
  activateAddon,
} from "@/api/addon";
import { AddonRun } from "@/structure/addon";
import { layout } from "@/manager/layout";

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
    addonsById(activeAddons) {
      const results = {};
      for (let i = 0; i < activeAddons.length; i++) {
        const addon = activeAddons[i];
        results[addon.id] = addon;
      }
      return results;
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

export async function getBrowserAddons(url = null) {
  const newAddons = await getAddons("", url);
  [addons.browserAddons, addons.browserNext, addons.browserPrev] = newAddons;
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
  addons.browserAddons = addons.browserAddons.map((a) => (a == addon) ? newAddon : a);
}
