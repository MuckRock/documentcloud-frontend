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
          return getDefault(addon.parameters, {});
        },
        user(addon) {
          return addon.user;
        },
        active(addon) {
          return addon.active;
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

export class AddonRun extends Svue {
  constructor(rawAddonRun, structure = {}) {
    const computed = structure.computed == null ? {} : structure.computed;
    super({
      data() {
        const data = structure.data == null ? {} : structure.data();
        data.addonRun = rawAddonRun;
        return data;
      },
      computed: {
        ...computed,
        uuid(addonRun) {
          return addonRun.uuid;
        },
        addonName(addonRun) {
          return addonRun.addon.name;
        },
        user(addonRun) {
          return addonRun.user;
        },
        status(addonRun) {
          return addonRun.status;
        },
        failure(status) {
          return status === "failure" || status === "cancelled";
        },
        progress(addonRun) {
          return addonRun.progress;
        },
        message(addonRun) {
          return addonRun.message;
        },
        fileUrl(addonRun) {
          return addonRun.file_url;
        },
        rawCreatedAt(addonRun) {
          // Unprocessed created at
          return addonRun.created_at;
        },
        createdAt(rawCreatedAt) {
          return new Date(Date.parse(rawCreatedAt));
        },
        rawUpdatedAt(addonRun) {
          // Unprocessed updated at
          return addonRun.updated_at;
        },
        updatedAtTimestamp(rawUpdatedAt) {
          return Date.parse(rawUpdatedAt);
        },
        updatedAt(updatedAtTimestamp) {
          return new Date(updatedAtTimestamp);
        },
        rating(addonRun) {
          return addonRun.rating;
        },
        comment(addonRun) {
          return addonRun.comment;
        },
      },
    });
  }
}

export class AddonEvent extends Svue {
  constructor(rawAddonEvent, structure = {}) {
    const computed = structure.computed == null ? {} : structure.computed;
    super({
      data() {
        const data = structure.data == null ? {} : structure.data();
        data.addonEvent = rawAddonEvent;
        return data;
      },
      computed: {
        ...computed,
        id(addonEvent) {
          return addonEvent.id;
        },
        user(addonEvent) {
          return addonEvent.user;
        },
        parameters(addonEvent) {
          return getDefault(addonEvent.parameters, {});
        },
        event(addonEvent) {
          return addonEvent.event;
        },
      },
    });
  }
}
