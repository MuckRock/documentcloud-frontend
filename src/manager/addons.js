import { Svue } from "svue";
import { getActiveAddons, postAddonDispatch, getAddonRuns } from "@/api/addon";
import { AddonRun } from "@/structure/addon";

export function done(run) {
  return run.status != "queued" && run.status != "in_progress";
}

export const addons = new Svue({
  data() {
    return {
      hasInited: false,
      activeAddons: [],
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
