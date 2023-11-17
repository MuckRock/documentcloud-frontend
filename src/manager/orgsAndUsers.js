import { Svue } from "svue";

import { pushToast } from "../common/Toast.svelte";

import { router, pushUrl, nav } from "../router/router.js";
import {
  getMe,
  changeActiveOrg,
  getOrganizationsByIds,
  getUser,
  getUsers,
  getOrganization,
} from "../api/orgAndUser.js";
import { SQUARELET_URL } from "../api/auth.js";
import { projects, initProjects } from "./projects.js";
import { userUrl, allDocumentsUrl } from "../search/search.js";
import { layout } from "./layout.js";
import { wrapLoad } from "../util/wrapLoad.js";

export const orgsAndUsers = new Svue({
  data() {
    return {
      me: null,
      selfOrgs: null,
      usersById: {},
      orgsById: {},
      projects,
      router,
      hasInited: false,
      hasInitedProjects: false,
      sameOrgUsers: [],
    };
  },
  watch: {
    // Don't re-request
    "router.resolvedRoute"() {
      const route = router.resolvedRoute;
      if (
        route != null &&
        (route.name == "app" || route.name == "home" || route.name == "default")
      ) {
        // Initiate orgs and users in the app
        if (!this.hasInited) {
          this.hasInited = true;
          initOrgsAndUsers(() => reroute(route));
        } else {
          reroute(route);
        }

        initProjectsIfNecessary(route);
        if (
          route != null &&
          route.name == "app" &&
          this.me != null &&
          !this.hasInitedProjects
        ) {
          this.hasInitedProjects = true;
          initProjects(this.me);
        }
      }
    },
    me() {
      const route = router.resolvedRoute;
      initProjectsIfNecessary(route);
    },
  },
  computed: {
    loggedIn(me) {
      return me != null;
    },
    isStaff(me) {
      if (me == null) return false;
      return me.is_staff == true;
    },
    isVerified(me) {
      if (me == null) return false;
      return me.verified_journalist;
    },
    orgIdList(me) {
      if (me == null) return [];
      return me.organizations;
    },
  },
});

function reroute(route) {
  if (route == null) return;
  if (route.name == "app" && route.props.q == null) {
    // Redirect to proper route if no search params are set
    if (orgsAndUsers.me != null) {
      // Redirect to get self user route if no search params are set
      pushUrl(userUrl(orgsAndUsers.me));
    } else {
      // Redirect to all documents if not logged in
      pushUrl(allDocumentsUrl());
    }
  } else if (route.name == "default") {
    // On the default page, nav to app or home based on current user
    if (orgsAndUsers.me != null) {
      pushUrl(userUrl(orgsAndUsers.me));
    } else {
      nav("home");
    }
  }
}

function initProjectsIfNecessary(route) {
  if (route == null) return;
  if (
    route.name == "app" &&
    orgsAndUsers.me != null &&
    !orgsAndUsers.hasInitedProjects
  ) {
    orgsAndUsers.hasInitedProjects = true;
    initProjects(orgsAndUsers.me);
  }
}

export async function initOrgsAndUsers(callback = null) {
  try {
    orgsAndUsers.me = await getMe();
  } catch (e) {
    orgsAndUsers.me = null;
  }
  if (orgsAndUsers.me !== null) {
    // Logged in
    orgsAndUsers.usersById[orgsAndUsers.me.id] = orgsAndUsers.me;
    orgsAndUsers.selfOrgs = await getOrganizationsByIds(
      orgsAndUsers.me.organizations,
    );
    for (let i = 0; i < orgsAndUsers.selfOrgs.length; i++) {
      const org = orgsAndUsers.selfOrgs[i];
      orgsAndUsers.orgsById[org.id] = org;
    }
    try {
      orgsAndUsers.sameOrgUsers = await inMyOrg(
        orgsAndUsers.me.organization.id,
        orgsAndUsers.me.id,
      );
    } catch (err) {
      console.error(err);
      orgsAndUsers.sameOrgUsers = [];
    }

    // Trigger update
    orgsAndUsers.usersById = orgsAndUsers.usersById;
    orgsAndUsers.orgsById = orgsAndUsers.orgsById;
  }
  if (callback != null) callback();
}

export async function getUserById(id) {
  try {
    const user = await getUser(id);
    orgsAndUsers.usersById[user.id] = user;
    // Trigger update
    orgsAndUsers.usersById = orgsAndUsers.usersById;
    return user;
  } catch (e) {
    return null;
  }
}

export async function getOrgById(id) {
  try {
    const org = await getOrganization(id);
    orgsAndUsers.orgsById[org.id] = org;
    // Trigger update
    orgsAndUsers.orgsById = orgsAndUsers.orgsById;
    return org;
  } catch (e) {
    return null;
  }
}

export async function changeActive(org) {
  if (orgsAndUsers.me == null) return;
  if (orgsAndUsers.me.organization.id == org.id) return;

  await wrapLoad(layout, async () => {
    await changeActiveOrg(org.id);

    orgsAndUsers.me.organization = org;
    orgsAndUsers.me = orgsAndUsers.me;
    try {
      orgsAndUsers.sameOrgUsers = await inMyOrg(
        orgsAndUsers.me.organization.id,
        orgsAndUsers.me.id,
      );
    } catch (err) {
      console.error(err);
      orgsAndUsers.sameOrgUsers = [];
    }
    pushToast("Successfully changed active organization");
  });
}

export async function usersInOrg(orgId) {
  return getUsers({ orgIds: [orgId] });
}

function alphabetizeUsers(userA, userB) {
  const aName = String(userA.name || userA.username);
  const bName = String(userB.name || userB.username);
  return aName.localeCompare(bName);
}

// same as above, but exclude me
export async function inMyOrg(orgId, myId) {
  if (!orgId) return [];
  const users = await getUsers({ orgIds: [orgId] });
  // Sort by admin status, then username
  const adminUsers = users
    .filter((u) => u.admin_organizations.includes(orgId))
    .sort(alphabetizeUsers);
  const regularUsers = users
    .filter((u) => !adminUsers.includes(u))
    .sort(alphabetizeUsers);
  // Remove me from the user list
  return [...adminUsers, ...regularUsers].filter((u) => u.id !== myId);
}

export function isPremiumOrg(org) {
  if (!org) return null;
  return !org.individual || org.plan === "Professional";
}

export function getCreditBalance(org) {
  if (!org) return null;
  return org.monthly_credits + org.purchased_credits;
}

export async function triggerPremiumUpgradeFlow() {
  // Redirect the user to their Squarelet account settings
  const url = SQUARELET_URL + `/users/~payment/`;
  window?.open(url);
}

// TODO: Handle flow for purchasing premium credits
export async function triggerCreditPurchaseFlow() {
  alert("Purchase Credits!");
}
