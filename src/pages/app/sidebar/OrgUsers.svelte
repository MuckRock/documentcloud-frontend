<script>
  import Title from "@/common/Title";
  import Link from "@/router/Link";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";
  import { userUrl, orgUrl } from "@/search/search";
</script>

<style>
  .org-users {
    padding: 0 25px;
  }

  .org-users .users {
    margin: 20px 0 40px 0;
  }
</style>

<div class="org-users">
  {#if $orgsAndUsers.me !== null && !$orgsAndUsers.me.organization.individual}
    <Title small={true}>
      Users in organization: <Link
        plusReplace={true}
        toUrl={orgUrl($orgsAndUsers.me.organization)}
        >{$orgsAndUsers.me.organization.name}</Link
      >
    </Title>

    <ul class="users">
      {#each $orgsAndUsers.sameOrgUsers as user}
        <li>
          <Link plusReplace={true} toUrl={userUrl(user)}>{user.name}</Link>
        </li>
      {/each}
    </ul>
  {/if}
</div>
