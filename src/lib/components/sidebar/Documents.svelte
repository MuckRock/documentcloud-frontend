<script lang="ts">
  import type { Org } from "$lib/api/types";
  import type { Writable } from "svelte/store";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    Search16,
    File16,
    Globe16,
    Lock16,
    Organization16,
    Person16,
  } from "svelte-octicons";
  import { page } from "$app/state";

  import Button from "$lib/components/common/Button.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";
  import SignedIn from "$lib/components/common/SignedIn.svelte";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";

  import { userDocs, searchUrl } from "$lib/utils/search";
  import { getCurrentUser } from "$lib/utils/permissions";

  const me = getCurrentUser();
  const org: Writable<Org> = getContext("org");

  let query = $derived(page.url.searchParams?.get("q") || "");

  let mine = $derived($me ? userDocs($me) : "");
  let minePublic = $derived($me ? userDocs($me, "public") : "");
  let minePrivate = $derived($me ? userDocs($me, "private") : "");

  let orgDocs = $derived($org ? `organization:${$org.id}` : "");
</script>

<SignedIn>
  <SidebarGroup name="documents">
    {#snippet title()}
      <NavItem>
        <File16 slot="start" />
        {$_("documents.documents")}
      </NavItem>
    {/snippet}

    {#snippet action()}
      <Button ghost minW={false} mode="primary" size="small" href="/documents">
        <Search16 height="14" width="14" />
        {$_("common.explore")}
      </Button>
    {/snippet}

    <NavItem small hover href={searchUrl(mine).href} active={query === mine}>
      <Person16 height={14} width={14} slot="start" />
      {$_("documents.yourDocuments")}
    </NavItem>
    <NavItem
      small
      hover
      href={searchUrl(minePrivate).href}
      active={query === minePrivate}
    >
      <Lock16 height={14} width={14} slot="start" />
      {$_("documents.accessDocuments", {
        values: { access: "Private " },
      })}
    </NavItem>
    <NavItem
      small
      hover
      href={searchUrl(minePublic).href}
      active={query === minePublic}
    >
      <Globe16 height={14} width={14} slot="start" />
      {$_("documents.accessDocuments", {
        values: { access: "Public " },
      })}
    </NavItem>
    {#if $org && !$org.individual}
      <NavItem
        small
        hover
        href={searchUrl(orgDocs).href}
        active={query === orgDocs}
      >
        <Organization16 height={14} width={14} slot="start" />
        {$_("documents.nameDocuments", {
          values: { name: $org.name, access: "" },
        })}
      </NavItem>
    {/if}
  </SidebarGroup>
  <NavItem slot="signedOut" href={searchUrl("").href}>
    <File16 slot="start" />
    {$_("documents.publicDocuments")}
  </NavItem>
</SignedIn>
