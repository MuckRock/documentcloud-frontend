import { Svue } from "svue";
import {
  // getAddon,
  getAddons,
  postAddonDispatch,
  getAddonRuns,
} from "@/api/addon";
import { AddonRun } from "@/structure/addon";

export function done(run) {
  return run.status != "queued" && run.status != "in_progress";
}

export const addons = new Svue({
  data() {
    return {
      hasInited: false,
      addons: [],
      runs: [],
    };
  },
  computed: {
    addonsById(addons) {
      const results = {};
      for (let i = 0; i < addons.length; i++) {
        const addon = addons[i];
        results[addon.id] = addon;
      }
      return results;
    },
    pollEvents(runs) {
      if (runs.filter(x => !done(x)).length === 0) return [];
      return [updateRuns];
    },
  },
});

export async function initAddons(me) {
  const newAddons = await getAddons();
  addons.addons = newAddons;

  updateRuns();
}

async function updateRuns() {
  const newRuns = await getAddonRuns();
  addons.runs = newRuns;
}

export async function dispatchAddon(addonId, userParameters, userActiveQuery, userSelected) {
  const addon = addons.addonsById[addonId];
  const response = await postAddonDispatch(addon, userParameters, userActiveQuery , userSelected);
  addons.runs = [response, ...addons.runs];
  return response;
}

export function removeRun(uuid) {
  addons.runs = addons.runs.filter((addon) => addon.uuid != uuid);
}
