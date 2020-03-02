<script>
  import Link from "@/router/Link";
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";
  import Dropdown from "@/common/Dropdown";

  import { orgsAndUsers, changeActive } from "@/manager/orgsAndUsers";
  import { SIGN_IN_URL, SIGN_OUT_URL } from "@/api/auth";

  function transformOrgIds(ids) {
    const results = [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const org = orgsAndUsers.orgsById[id];
      if (org != null) results.push(org);
    }
    return results;
  }

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
  $: orgs = me == null ? [] : transformOrgIds(me.organizations);
  $: individualOrg = pickOne(orgs.filter(org => org.individual));
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
  <Link to="home">Home</Link>
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
        <a href={SIGN_OUT_URL} style="color: inherit">
          <MenuItem>Sign out</MenuItem>
        </a>
        <MenuItem selectable={false}>
          <div class="small">Change organization</div>
        </MenuItem>
        {#if individualOrg != null}
          <MenuItem on:click={() => change(individualOrg)}>
            Personal Account
            {#if individualOrg.id == currentOrg.id}
              <span class="check">✓</span>
            {/if}
          </MenuItem>
        {/if}
        {#each orgs as org}
          {#if individualOrg == null || org.id != individualOrg.id}
            <MenuItem on:click={() => change(org)}>
              {org.name}
              {#if org.id == currentOrg.id}
                <span class="scope">✓</span>
              {/if}
            </MenuItem>
          {/if}
        {/each}
      </Menu>

    </Dropdown>
  {:else}
    <a href={SIGN_IN_URL}>Sign in</a>
  {/if}
</div>
