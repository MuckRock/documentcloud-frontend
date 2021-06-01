<script>
  import Link from "@/router/Link";
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";
  import Dropdown from "@/common/Dropdown";

  import { orgsAndUsers, changeActive } from "@/manager/orgsAndUsers";
  import { SQUARELET_URL, SIGN_IN_URL, SIGN_OUT_URL } from "@/api/auth";

  function pickOne(list) {
    if (list == null) return null;
    if (list.length != 1) return null;
    return list[0];
  }

  async function change(org) {
    await changeActive(org);
    // Fix dropdown resizing
    window.dispatchEvent(new Event("resize"));
  }

  $: me = $orgsAndUsers.me;
  $: individual = me != null && me.organization.individual;
  $: currentOrg = me == null ? null : me.organization;
  $: orgs = $orgsAndUsers.selfOrgs == null ? [] : $orgsAndUsers.selfOrgs;
  $: individualOrg = pickOne(orgs.filter((org) => org.individual));
</script>

<style lang="scss">
  .auth {
    user-select: none;
    margin: 0 0 20px 0;

    :global(a),
    .title,
    .dot {
      color: $gray;
      font-size: 13px;
    }

    .dot {
      margin: 0 3px;
    }

    .scope {
      color: gray;
    }
  }
</style>

<div class="auth">
  <Link to="home">{$_("authSection.home")}</Link>
  <span class="dot">·</span>
  <Dropdown fixed={true}>
    <span class="action" slot="title">
      <span class="nowrap title">
        {$_("authSection.help")} <span class="dropper">▼</span>
      </span>
    </span>
    <Menu>
      <Link toUrl="/help/tips" color={true}>
        <MenuItem>{$_("authSection.tips")}</MenuItem>
      </Link>
      <Link toUrl="/help/search" color={true}>
        <MenuItem>{$_("authSection.searchDocs")}</MenuItem>
      </Link>
      <Link toUrl="/help/api" color={true}>
        <MenuItem>{$_("authSection.apiDocs")}</MenuItem>
      </Link>
      <Link toUrl="mailto:info@documentcloud.org" color={true}>
        <MenuItem>Email Us</MenuItem>
      </Link>
    </Menu>
  </Dropdown>
  <span class="dot">·</span>
  {#if me != null}
    <Dropdown fixed={true}>
      <span class="action" slot="title">
        <span class="nowrap title">
          {me.name}
          {#if !individual}({me.organization.name}){/if}
          <span class="dropper">▼</span>
        </span>
      </span>
      <Menu>
        <a href={SQUARELET_URL} target="_blank" style="color: inherit">
          <MenuItem>{$_("authSection.acctSettings")}</MenuItem>
        </a>
        <a href={SIGN_OUT_URL} style="color: inherit">
          <MenuItem>{$_("authSection.signOut")}</MenuItem>
        </a>
        <MenuItem selectable={false}>
          <div class="small">{$_("authSection.changeOrg")}</div>
        </MenuItem>
        {#if individualOrg != null}
          <MenuItem on:click={() => change(individualOrg)}>
            {$_("authSection.personalAcct")}
            {#if individualOrg.id == currentOrg.id}
              <span class="scope">✓</span>
            {/if}
          </MenuItem>
        {/if}
        {#each orgs as org}
          {#if individualOrg == null || org.id != individualOrg.id}
            <MenuItem on:click={() => change(org)}>
              {org.name}
              {#if org.id == currentOrg.id}<span class="scope">✓</span>{/if}
            </MenuItem>
          {/if}
        {/each}
      </Menu>
    </Dropdown>
  {:else}<a href={SIGN_IN_URL}>{$_("authSection.signIn")}</a>{/if}
</div>
