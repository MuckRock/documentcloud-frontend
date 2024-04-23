<script>
  import { _, locale } from "svelte-i18n";

  import Link from "../../router/Link.svelte";
  import Menu from "../../common/Menu.svelte";
  import MenuItem from "../../common/MenuItem.svelte";
  import Dropdown from "../../common/Dropdown.svelte";

  import { SQUARELET_URL, SIGN_IN_URL, SIGN_OUT_URL } from "../../api/auth.js";
  import langs from "../../langs/langs.json";
  import { showMailkeySelected } from "../../manager/manager.js";
  import { orgsAndUsers, changeActive } from "../../manager/orgsAndUsers.js";

  function pickOne(list) {
    if (list == null) return null;
    if (list.length != 1) return null;
    return list[0];
  }

  function triggerWindowResize() {
    window.dispatchEvent(new Event("resize"));
  }

  async function change(org) {
    await changeActive(org);
    // Fix dropdown resizing
    triggerWindowResize();
  }

  function updateLanguage(code) {
    // Update the locale
    $locale = code;
    try {
      localStorage.setItem("dc-locale", code);
    } catch (e) {}

    // Fix dropdown resizing
    triggerWindowResize();
  }

  $: me = $orgsAndUsers.me;
  $: individual = me !== null && me.organization.individual;
  $: currentOrg = me === null ? null : me.organization;
  $: orgs = $orgsAndUsers.selfOrgs === null ? [] : $orgsAndUsers.selfOrgs;
  $: individualOrg = pickOne(orgs.filter((org) => org.individual));
</script>

<div class="auth">
  <Link to="home">{$_("common.home")}</Link>
  <span class="dot">·</span>
  <Dropdown name="help" fixed={true}>
    <span class="action" slot="title">
      <span class="nowrap title">
        {$_("authSection.help")} <span class="dropper">▼</span>
      </span>
    </span>
    <Menu>
      <Link toUrl="/help/faq" color={true}>
        <MenuItem>{$_("authSection.faq")}</MenuItem>
      </Link>
      <Link toUrl="/help/search" color={true}>
        <MenuItem>{$_("authSection.searchDocs")}</MenuItem>
      </Link>
      <Link toUrl="/help/api" color={true}>
        <MenuItem>{$_("authSection.apiDocs")}</MenuItem>
      </Link>
      <Link toUrl="/help/add-ons" color={true}>
        <MenuItem>{$_("authSection.addOns")}</MenuItem>
      </Link>
      <Link toUrl="/help/premium" color={true}>
        <MenuItem>{$_("authSection.premium")}</MenuItem>
      </Link>
      <a href="mailto:info@documentcloud.org" class="color" target="_blank">
        <MenuItem>{$_("authSection.emailUs")}</MenuItem>
      </a>
    </Menu>
  </Dropdown>
  <span class="dot">·</span>
  {#if langs.length > 1}
    <Dropdown name="language" fixed={true}>
      <span class="action" slot="title">
        <span class="nowrap title">
          {$_("authSection.language")} <span class="dropper">▼</span>
        </span>
      </span>
      <Menu>
        {#each langs as [name, code]}
          <MenuItem on:click={() => updateLanguage(code)}
            >{name}
            {#if code == $locale}
              <span class="scope">✓</span>
            {/if}</MenuItem
          >
        {/each}
      </Menu>
    </Dropdown>
    <span class="dot">·</span>
  {/if}
  {#if me != null}
    <Dropdown name="organization" fixed={true}>
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
        <MenuItem on:click={showMailkeySelected}>
          {$_("authSection.uploadEmail")}
        </MenuItem>
        <a href={SIGN_OUT_URL} style="color: inherit">
          <MenuItem>{$_("authSection.signOut")}</MenuItem>
        </a>
        <MenuItem selectable={false}>
          <div class="small">{$_("authSection.changeOrg")}</div>
        </MenuItem>
        {#if individualOrg !== null}
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

<style>
  .auth {
    user-select: none;
    margin: 0 0 20px 0;
  }
  .auth :global(a),
  .auth .title,
  .auth .dot {
    color: var(--gray), rgba(0, 0, 0, 0.53);
    font-size: 13px;
  }

  .auth .dot {
    margin: 0 3px;
  }

  .auth .scope {
    color: gray;
  }

  .auth .color {
    color: var(--primary, #4294f0);
  }
</style>
