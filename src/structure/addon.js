import { Svue } from "svue";

function getDefault(obj, defaultValue = "") {
  if (obj == null) return defaultValue;
  return obj;
}

export class Addon extends Svue {
  constructor(rawAddon, structure = {}) {
    const computed = structure.computed == null ? {} : structure.computed;
    super({
      data() {
        const data = structure.data == null ? {} : structure.data();
        data.addon = rawAddon;
        return data;
      },
      computed: {
        ...computed,
        id(addon) {
          return addon.id;
        },
        name(addon) {
          return getDefault(addon.name);
        },
        repository(addon) {
          return getDefault(addon.repository);
        },
        parameters(addon) {
          return getDefault(addon.parameters);
        },
        access(addon) {
          return addon.user
        },
        organization(addon) {
          const org = getDefault(addon.organization, {});
          if (org.individual) return null;
          return org.name;
        },
      },
    });
  }
}
