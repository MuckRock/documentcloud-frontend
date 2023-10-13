<script lang="ts">
  import { _, locale } from "svelte-i18n";

  import Link from "../../../router/Link.svelte";
  import Dropdown from "../../../common/Dropdown.svelte";
  import Menu from "../../../common/Menu.svelte";
  import MenuItem from "../../../common/MenuItem.svelte";
  import MenuTitle from "../../../common/MenuTitle.svelte";

  import {
    SQUARELET_URL,
    SIGN_IN_URL,
    SIGN_OUT_URL,
  } from "../../../api/auth.js";
  import { showMailkeySelected } from "../../../manager/manager.js";
  import { orgsAndUsers, changeActive } from "../../../manager/orgsAndUsers.js";

  import langs from "../../../langs/langs.json";
  import LanguageIcon from "../../../common/icons/Language.svelte";
  import Help from "../../../common/icons/Help.svelte";

  $: currentLang = langs.find(([_, code]) => code == $locale);
  $: user = $orgsAndUsers.me;
  $: individual = user !== null && user.organization.individual;
  $: currentOrg = user === null ? null : user.organization;

  function updateLanguage(code) {
    // Update the locale
    $locale = code;
    try {
      localStorage.setItem("dc-locale", code);
    } catch (e) {}
  }

  // function pickOne(list) {
  //   if (list == null) return null;
  //   if (list.length != 1) return null;
  //   return list[0];
  // }

  // function triggerWindowResize() {
  //   window.dispatchEvent(new Event("resize"));
  // }

  // async function change(org) {
  //   await changeActive(org);
  //   // Fix dropdown resizing
  //   triggerWindowResize();
  // }

  // $: me = $orgsAndUsers.me;
  // $: individual = me !== null && me.organization.individual;
  // $: currentOrg = me === null ? null : me.organization;
  // $: orgs = $orgsAndUsers.selfOrgs === null ? [] : $orgsAndUsers.selfOrgs;
  // $: individualOrg = pickOne(orgs.filter((org) => org.individual));
</script>

<style>
  .account-navigation {
    width: 100%;
    font-size: 0.875em;
    display: flex;
    justify-content: space-between;
  }

  .account-navigation section {
    display: flex;
    gap: 1em;
  }
</style>

<nav class="account-navigation">
  <section class="primary" />
  <section class="secondary">
    {#if langs.length > 1}
      <!-- Language Menu -->
      <Dropdown name="language" fixed={true}>
        <MenuTitle
          slot="title"
          label={currentLang[0] ?? $_("authSection.language")}
        >
          <LanguageIcon size={1.5} slot="icon" />
        </MenuTitle>
        <Menu>
          {#each langs as [name, code]}
            <MenuItem on:click={() => updateLanguage(code)}>
              {name}
              {#if code == $locale}
                <span class="scope">✓</span>
              {/if}
            </MenuItem>
          {/each}
        </Menu>
      </Dropdown>
    {/if}
    <!-- Help Menu -->
    <Dropdown name="help" fixed={true}>
      <MenuTitle slot="title" label={$_("authSection.help")}>
        <Help size={1.5} slot="icon" />
      </MenuTitle>
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
  </section>
</nav>
