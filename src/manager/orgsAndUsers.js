import { Svue } from "svue";
import { router, pushUrl } from "@/router/router";
import { getOrganizations, getUsers, getMe } from "@/api/orgAndUser";
import { projects, initProjects } from "./projects";
import { uniquify } from "@/util/array";
import { userUrl } from "@/search/search";

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
  const routeProps = router.resolvedRoute.props;
  if (routeProps.q == null || routeProps.dq == null) {
    // Redirect to get self user route if no search params are set
    pushUrl(userUrl(orgsAndUsers.me));
  }

  // Populate projects
  initProjects(orgsAndUsers.me);
}

async function initOrgsAndUsers() {
  getSelfUser();

  // Get non-individual organizations
  orgsAndUsers.organizations = await getOrganizations(false);

  const orgIds = orgsAndUsers.organizations.map(proj => proj.id);
  orgsAndUsers.organizationUsers = await getUsers({ orgIds });
}
