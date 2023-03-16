<script>
  import Title from "@/common/Title";
  import Link from "@/router/Link";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";
  import { userUrl, orgUrl } from "@/search/search";

  import { _ } from "svelte-i18n";
</script>

<style>
  .org-users {
    /*padding: 0 25px;*/
    padding: 0;
  }

  .org-users summary {
    cursor: pointer;
    padding: 0 25px;
  }

  .org-users .users {
    margin: 20px 0;

    list-style: none;
    padding-inline-start: 0;
  }

  .org-users .users li {
    color: rgba(0, 0, 0, 0.8);
    font-size: 14px;
    padding: 0;
  }

  .org-users .users li :global(a) {
    display: block;
    padding: 5px 25px;
  }

  .org-users .users li :global(a.active) {
    /* $primary-faded */
    background: rgba(66, 148, 240, 0.13);
  }

  .org-users h3 {
    display: inline;
    font-size: 16px;
  }
</style>

<div class="org-users">
  {#if $orgsAndUsers.me !== null && !$orgsAndUsers.me.organization.individual}
    <details>
      <summary>
        <h3>
          {$_("organizations.sameOrgUsers")}: <Link
            plusReplace={true}
            toUrl={orgUrl($orgsAndUsers.me.organization)}
            >{$orgsAndUsers.me.organization.name}</Link
          >
        </h3>
      </summary>

      <ul class="users">
        {#each $orgsAndUsers.sameOrgUsers as user}
          <li>
            <Link plusReplace={true} toUrl={userUrl(user)}>{user.name}</Link>
          </li>
        {/each}
      </ul>
    </details>
  {/if}
</div>
