<script>
  import Link from "@/router/Link.svelte";
  import { allDocumentsUrl, userUrl, orgUrl } from "@/search/search.js";
  import { orgsAndUsers } from "@/manager/orgsAndUsers.js";
  import { _ } from "svelte-i18n";
</script>

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

<div class="linksection">
  <Link plusReplace={true} toUrl={allDocumentsUrl()}>
    <div class="link">{$_("projects.allDocuments")}</div>
  </Link>
  {#if $orgsAndUsers.me !== null}
    <Link plusReplace={true} toUrl={userUrl($orgsAndUsers.me)}>
      <div class="link">{$_("projects.yourDocuments")}</div>
    </Link>
    <Link plusReplace={true} toUrl={userUrl($orgsAndUsers.me, true)}>
      <div class="link">{$_("projects.yourPubDocuments")}</div>
    </Link>
    {#if $orgsAndUsers.me.organization != null && !$orgsAndUsers.me.organization.individual}
      <Link plusReplace={true} toUrl={orgUrl($orgsAndUsers.me.organization)}>
        <div class="link">
          {$_("projects.orgDocuments", {
            values: { name: $orgsAndUsers.me.organization.name },
          })}
        </div>
      </Link>
    {/if}
  {/if}
</div>
