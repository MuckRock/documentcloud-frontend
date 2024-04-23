<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Globe16, Infinity16, Lock16, Organization16 } from "svelte-octicons";
  import { type User, isOrg } from "../../../api/types/orgAndUser";
  import Link from "../../../router/Link.svelte";
  import { allDocumentsUrl, userUrl, orgUrl } from "../../../search/search.js";
  import ListItem from "./ListItem.svelte";

  export let user: User | null;
</script>

<Link plusReplace={true} toUrl={allDocumentsUrl()}>
  <ListItem label={$_("projects.allDocuments")}
    ><Infinity16 slot="icon" /></ListItem
  >
</Link>
{#if user !== null}
  <Link plusReplace={true} toUrl={userUrl(user, { access: "public" })}>
    <ListItem label={$_("projects.yourPubDocuments")}>
      <Globe16 slot="icon" />
    </ListItem>
  </Link>
  <Link plusReplace={true} toUrl={userUrl(user, { access: "private" })}>
    <ListItem label={$_("projects.yourDocuments")}>
      <Lock16 slot="icon" />
    </ListItem>
  </Link>
  {#if isOrg(user.organization) && !user.organization?.individual}
    <Link plusReplace={true} toUrl={orgUrl(user.organization)}>
      <ListItem
        label={$_("projects.orgDocuments", {
          values: { name: user.organization.name },
        })}
      >
        <Organization16 slot="icon" />
      </ListItem>
    </Link>
  {/if}
{/if}
