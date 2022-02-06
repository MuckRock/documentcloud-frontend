import { Svue } from "svue";
import {
  // getAddon,
  getAddons,
  postAddonDispatch,
} from "@/api/addon";

export const addons = new Svue({
  data() {
    return {
      addons: [],
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
    }
  },
});


export async function initAddons(me) {
  const newAddons = await getAddons();

  addons.addons = newAddons;
}

export async function dispatchAddon(addonId, info,
  layout,
  selected,
  viewerUpdate = () => { }) {
  const response = await postAddonDispatch(addonId, info, selected)
  return response;
}

export function selectedDocsInProject(project) {
  // Abort early if project or docs are empty
  if (project == null) return "none";
  const docs = layout.selected;
  if (docs.length == 0) return "none";

  let atLeastOneDocInProject = false;
  let atLeastOneDocOutsideProject = false;
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    if (doc.projectIds.includes(project.id)) {
      atLeastOneDocInProject = true; // can only be partial or full
      if (atLeastOneDocOutsideProject) return "partially";
    } else {
      atLeastOneDocOutsideProject = true; // can only be partial or none
      if (atLeastOneDocInProject) return "partially";
    }
  }

  if (!atLeastOneDocOutsideProject) return "fully";
  if (!atLeastOneDocInProject) return "none";
  return "partially";
}

export async function createNewProject(title, description) {
  // const project = await newAddon(title, description);
  // addons.addons = [...addons.addons, addon];
}