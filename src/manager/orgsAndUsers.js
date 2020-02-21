import { Svue } from "svue";
import { router } from "@/router/router";
import { getOrganizations, getUsers, getMe } from "@/api/orgAndUser";
import { projects } from "./projects";
import { uniquify } from "@/util/array";

let previousRouteName = null;

export const orgsAndUsers = new Svue({
  data() {
    return {
      me: null,
      organizations: [],
      organizationUsers: [],
      projects,
      router
    };
  },
  watch: {
    // Don't re-request across searches within the app
    "router.resolvedRoute"() {
      const route = router.resolvedRoute;
      if (route != null && route.name == "app") {
        if (route.name != previousRouteName) initOrgsAndUsers();
      } else {
        this.me = null;
        this.organizations = [];
        this.users = [];
      }
      previousRouteName = route == null ? null : route.name;
    }
  },
  computed: {
    allUsers(projects, organizationUsers) {
      return uniquify([...projects.projectUsers, ...organizationUsers]);
    }
  }
});

async function getSelfUser() {
  orgsAndUsers.me = await getMe();
  console.log("ME", orgsAndUsers.me);
}

async function initOrgsAndUsers() {
  getSelfUser();

  // Get non-individual organizations
  orgsAndUsers.organizations = await getOrganizations(false);

  const orgIds = orgsAndUsers.organizations.map(proj => proj.id);
  orgsAndUsers.organizationUsers = await getUsers({ orgIds });
  console.log(orgsAndUsers.allUsers);
  console.log(orgsAndUsers.organizations);
}
