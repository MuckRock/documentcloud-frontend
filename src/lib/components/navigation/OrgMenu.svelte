<script lang="ts">
  import type { Org, User } from "@/api/types";

  import { invalidateAll } from "$app/navigation";
  import { _, locale } from "svelte-i18n";
  import { ChevronDown12, ChevronUp12, Person16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import CreditMeter, {
    formatResetDate,
  } from "@/premium-credits/CreditMeter.svelte";
  import Dropdown, { closeDropdown } from "@/common/Dropdown2.svelte";
  import Menu from "@/common/Menu.svelte";
  import MenuInsert from "@/common/MenuInsert.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import PremiumIcon from "@/common/icons/Premium.svelte";

  import { getUpgradeUrl, setOrg } from "$lib/api/accounts";
  import { searchUrl, userDocs } from "$lib/utils/search";
  import { getCsrfToken } from "$lib/utils/api";

  export let active_org: Org;
  export let orgs: Org[] = [];
  export let users: User[] = [];
  export let position = "bottom right";

  $: isPremium = active_org.plan !== "Free";
  $: upgrade_url = getUpgradeUrl(active_org).href;

  // wrapping setOrg here
  async function switchOrg(org: Org) {
    const csrf_token = getCsrfToken();

    await setOrg(org.id, csrf_token);
    await invalidateAll();

    closeDropdown("org-menu");
  }
</script>

<Dropdown id="org-menu" {position}>
  <SidebarItem slot="title">
    {#if active_org.individual}
      <div class="premium">
        <PremiumIcon />
        {$_("authSection.premiumUpgrade.title")}
      </div>
    {:else}
      <div class="avatar">
        <img
          alt={$_("authSection.org.avatar", {
            values: { name: active_org.name },
          })}
          src={active_org.avatar_url}
        />
      </div>
      <p class="organization">{active_org.name}</p>
      <div class="dropdownArrow">
        {#if position.includes("bottom")}
          <ChevronDown12 />
        {:else}
          <ChevronUp12 />
        {/if}
      </div>
    {/if}
  </SidebarItem>

  <Menu>
    <div class="menu-inner">
      {#if isPremium}
        <MenuInsert>
          <CreditMeter
            id="org-credits"
            label={$_("authSection.credits.monthlyOrg")}
            helpText={$_("authSection.credits.refreshOn", {
              values: {
                date: formatResetDate(active_org.credit_reset_date, $locale),
              },
            })}
            value={active_org.monthly_credits}
            max={active_org.monthly_credit_allowance}
          />
        </MenuInsert>
      {:else}
        <div class="min-width">
          <MenuInsert>
            <h3 class="heading">{$_("authSection.premiumUpgrade.heading")}</h3>
            <p class="description">
              {$_("authSection.premiumUpgrade.description")}
            </p>
            <Button mode="premium" href={upgrade_url}>
              {$_("authSection.premiumUpgrade.cta")}
            </Button>
            <div class="learnMore">
              <a href="/help/premium/">
                {$_("authSection.premiumUpgrade.docs")}
              </a>
            </div>
          </MenuInsert>
        </div>
      {/if}

      {#if users.length}
        <p class="user-count">
          {$_("authSection.org.userCount", { values: { n: users.length } })}
        </p>
        <ul class="user-list">
          {#each users as user}
            {@const href = searchUrl(userDocs(user)).href}
            <li>
              <SidebarItem
                {href}
                on:click={(e) => closeDropdown("organization")}
              >
                {#if user.avatar_url}
                  <img src={user.avatar_url} class="avatar" alt="" />
                {:else}
                  <span class="icon"><Person16 /></span>
                {/if}
                <span class="name">{user.name}</span>
                {#if user.admin_organizations.includes(active_org.id)}
                  <span class="badge">{$_("authSection.org.adminRole")}</span>
                {/if}
              </SidebarItem>
            </li>
          {/each}
        </ul>
      {/if}

      {#if orgs.length}
        <p class="switch">
          {$_("authSection.org.changeOrg")}
        </p>
        <Dropdown id="org-switch">
          <SidebarItem slot="title">
            <div class="avatar">
              <img
                alt={$_("authSection.org.avatar", {
                  values: { name: active_org.name },
                })}
                src={active_org.avatar_url}
              />
            </div>
            <p class="organization">{active_org.name}</p>
            <span class="arrow"><ChevronDown12 /></span>
          </SidebarItem>
          <Menu>
            {#each orgs as org}
              <SidebarItem hover on:click={(e) => switchOrg(org)}>
                {org.name}
              </SidebarItem>
            {/each}
          </Menu>
        </Dropdown>
      {/if}
    </div>
  </Menu>
</Dropdown>

<style>
  .premium {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    gap: 0.5rem;
    color: var(--premium);
  }

  .min-width {
    min-width: 20rem;
  }

  .avatar {
    width: 1.5rem;
    height: 1.5rem;

    overflow: hidden;
    border-radius: 0.75rem;
    background: var(--gray-2, #d8dee2);
  }

  .avatar img {
    display: block;
    height: 100%;
    width: 100%;
  }

  .organization {
    color: var(--black, #233944);
    font-family: var(--font-sans, "Source Sans Pro");
    font-weight: var(--font-semibold, 600);
    line-height: 1rem;
  }

  .arrow {
    width: 1rem;
    height: 1rem;
    fill: var(--gray-4, #5c717c);
  }

  .user-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
    max-height: 14rem;
    overflow-y: auto;
  }

  .user-count,
  .switch {
    font-size: 0.875em;
    color: var(--gray-5);
    margin: 0.25rem 0.5rem;
  }

  .avatar,
  .icon {
    object-fit: cover;
    height: 1.5rem;
    width: 1.5rem;
    background: rgba(0, 0, 0, 0.1);
    /* border: 1px solid rgba(0, 0, 0, 0.05); */
    border-radius: 50%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .name {
    flex: 1 1 auto;
    font-size: var(--font-sm);
    font-weight: var(--font-regular);
  }

  .badge {
    margin-left: 1em;
    font-size: 0.75em;
    text-transform: uppercase;
    letter-spacing: 0.1ch;
    color: var(--primary);
  }

  .learnMore {
    font-size: 0.8em;
    color: var(--gray-4);
  }

  .learnMore:hover {
    opacity: 0.7;
  }

  @media (max-width: 32rem) {
    .organization {
      display: none;
    }
    .menu-inner {
      font-size: var(--font-sm);
    }
  }
</style>
