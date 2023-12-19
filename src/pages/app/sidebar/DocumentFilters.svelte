<script lang="ts">
  import { _ } from "svelte-i18n";
  import Link from "../../../router/Link.svelte";
  import { allDocumentsUrl, userUrl, orgUrl } from "../../../search/search.js";
  import { User } from "../accounts/types";

  export let user: User | null;
</script>

<div class="linksection">
  <Link plusReplace={true} toUrl={allDocumentsUrl()}>
    <div class="link">{$_("projects.allDocuments")}</div>
  </Link>
  {#if user !== null}
    <Link plusReplace={true} toUrl={userUrl(user)}>
      <div class="link">{$_("projects.yourDocuments")}</div>
    </Link>
    <Link plusReplace={true} toUrl={userUrl(user, true)}>
      <div class="link">{$_("projects.yourPubDocuments")}</div>
    </Link>
    {#if user.organization != null && typeof user.organization !== "string" && !user.organization.individual}
      <Link plusReplace={true} toUrl={orgUrl(user.organization)}>
        <div class="link">
          {$_("projects.orgDocuments", {
            values: { name: user.organization.name },
          })}
        </div>
      </Link>
    {/if}
  {/if}
</div>

<style>
  .linksection {
    margin: 20px 0 40px 0;
  }

  .linksection :global(a) {
    display: block;
    padding: 5px 24px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.8);
  }

  .linksection :global(a.active) {
    /* $primary-faded */
    background: rgba(66, 148, 240, 0.13);
  }

  @media screen and (max-width: 720px) {
    .linksection :global(a) {
      /* (24px + $sidebarAdd) */
      padding: 5px 24px 5px 48px;
    }
  }
</style>
