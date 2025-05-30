<script lang="ts">
  import type { Org, User } from "$lib/api/types";

  import { invalidateAll } from "$app/navigation";
  import { _, locale } from "svelte-i18n";
  import {
    ChevronDown12,
    ChevronUp12,
    Person16,
    People16,
    Organization16,
  } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import CreditMeter, {
    formatResetDate,
  } from "$lib/components/premium-credits/CreditMeter.svelte";
  import Dropdown, {
    type Placement,
  } from "$lib/components/common/Dropdown.svelte";
  import Menu from "$lib/components/common/Menu.svelte";
  import MenuInsert from "$lib/components/common/MenuInsert.svelte";
  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import PremiumIcon from "$lib/components/icons/Premium.svelte";

  import { SQUARELET_BASE } from "@/config/config";
  import { getUpgradeUrl, getUserName, setOrg } from "$lib/api/accounts";
  import { searchUrl, userDocs } from "$lib/utils/search";
  import { getCsrfToken } from "$lib/utils/api";
  import { remToPx } from "$lib/utils/layout";

  export let active_org: Org;
  export let orgs: Org[] = [];
  export let users: User[] = [];
  export let position: Placement = "bottom-end";

  let width: number;

  $: isPremium = active_org.plan !== "Free";
  $: isPro = isPremium && active_org.individual;
  $: upgrade_url = getUpgradeUrl(active_org).href;
  $: otherOrgs = orgs.filter((org) => org.id !== active_org.id);

  // wrapping setOrg here
  async function switchOrg(org: Org) {
    const csrf_token = getCsrfToken();
    if (!csrf_token) {
      console.error("Missing CSRF token");
      return;
    }
    await setOrg(org.id, csrf_token);
    await invalidateAll();
  }
</script>

<svelte:window bind:innerWidth={width} />

<Dropdown {position}>
  <svelte:fragment slot="anchor">
    {#if active_org.individual}
      <SidebarItem --fill="var(--green-3)" --color="var(--green-5)">
        <PremiumIcon slot="start" />
        {isPro
          ? $_("authSection.pro.title")
          : $_("authSection.premiumUpgrade.title")}
        <div class="dropdownArrow" slot="end">
          {#if position.includes("bottom")}
            <ChevronDown12 />
          {:else}
            <ChevronUp12 />
          {/if}
        </div>
      </SidebarItem>
    {:else}
      <SidebarItem>
        <div class="avatar" slot="start">
          <img
            alt={$_("authSection.org.avatar", {
              values: { name: active_org.name },
            })}
            src={active_org.avatar_url}
          />
        </div>
        {#if width > remToPx(48)}<p class="orgname hide-sm">
            {active_org.name}
          </p>{/if}
        <div class="dropdownArrow" slot="end">
          {#if position.includes("bottom")}
            <ChevronDown12 />
          {:else}
            <ChevronUp12 />
          {/if}
        </div>
      </SidebarItem>
    {/if}
  </svelte:fragment>
  <Menu slot="default" let:close>
    <div class="menu-inner" class:sm={width <= remToPx(32)}>
      {#if isPremium && active_org.monthly_credits && active_org.credit_reset_date}
        <MenuInsert>
          <CreditMeter
            id="org-credits"
            label={isPro
              ? $_("authSection.credits.monthlyPro")
              : $_("authSection.credits.monthlyOrg")}
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
        <SidebarGroup>
          <SidebarItem slot="title">
            <People16 slot="start" />
            {$_("authSection.org.userCount", { values: { n: users.length } })}
          </SidebarItem>
          <ul class="user-list">
            {#each users as user}
              {@const href = searchUrl(userDocs(user)).href}
              <li>
                <SidebarItem {href} on:click={close}>
                  <svelte:fragment slot="start">
                    {#if user.avatar_url}
                      <img src={user.avatar_url} class="avatar" alt="" />
                    {:else}
                      <span class="icon"><Person16 /></span>
                    {/if}
                  </svelte:fragment>
                  <span class="username">{getUserName(user)}</span>
                  {#if user.admin_organizations.includes(active_org.id)}
                    <span class="badge">{$_("authSection.org.adminRole")}</span>
                  {/if}
                </SidebarItem>
              </li>
            {/each}
          </ul>
        </SidebarGroup>
      {/if}
      {#if otherOrgs.length}
        <p class="switch">
          {$_("authSection.org.changeOrg")}
        </p>
        <Dropdown>
          <SidebarItem slot="anchor">
            <div class="avatar" slot="start">
              <img
                alt={$_("authSection.org.avatar", {
                  values: { name: active_org.name },
                })}
                src={active_org.avatar_url}
              />
            </div>
            <p class="orgname">{active_org.name}</p>
            <span class="arrow" slot="end"><ChevronDown12 /></span>
          </SidebarItem>
          <Menu --max-height="24rem">
            {#each otherOrgs as otherOrg}
              <SidebarItem
                hover
                on:click={(e) => {
                  switchOrg(otherOrg);
                  close();
                }}
              >
                {otherOrg.name}
              </SidebarItem>
            {/each}
          </Menu>
        </Dropdown>
      {:else}
        <Button ghost href="{SQUARELET_BASE}/organizations">
          <Organization16 />
          {$_("authSection.premiumUpgrade.orgs")}
        </Button>
      {/if}
    </div>
  </Menu>
</Dropdown>

<style>
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

  .orgname {
    color: var(--black, #233944);
    font-family: var(--font-sans, "Source Sans Pro");
    font-weight: var(--font-semibold, 600);
    margin-bottom: 0;
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

  .switch {
    color: var(--gray-4);
    margin: 1rem 0.5rem 0.25rem 0.5rem;
    text-transform: uppercase;
    font-size: var(--font-xs);
    font-weight: var(--font-semibold);
    letter-spacing: 0.0625rem;
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

  .username {
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

  .menu-inner {
    min-width: 24rem;
  }

  .menu-inner.sm {
    min-width: unset;
    font-size: var(--font-sm);
  }
</style>
