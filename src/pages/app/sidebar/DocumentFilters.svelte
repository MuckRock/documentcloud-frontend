<script lang="ts">
  import { _ } from "svelte-i18n";
  import Link from "../../../router/Link.svelte";
  import { allDocumentsUrl, userUrl, orgUrl } from "../../../search/search.js";
  import { User } from "../accounts/types";
  import { Globe16, Infinity16, Lock16, Organization16 } from "svelte-octicons";
  import ListItem from "./ListItem.svelte";

  export let user: User | null;
</script>

<Link plusReplace={true} toUrl={allDocumentsUrl()}>
  <ListItem label={$_("projects.allDocuments")}
    ><Infinity16 slot="icon" /></ListItem
  >
</Link>
{#if user !== null}
  <Link plusReplace={true} toUrl={userUrl(user, true)}>
    <ListItem label={$_("projects.yourPubDocuments")}>
      <Globe16 slot="icon" />
    </ListItem>
  </Link>
  <Link plusReplace={true} toUrl={userUrl(user)}>
    <ListItem label={$_("projects.yourDocuments")}>
      <Lock16 slot="icon" />
    </ListItem>
  </Link>
  {#if user.organization != null && typeof user.organization !== "string" && !user.organization.individual}
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
