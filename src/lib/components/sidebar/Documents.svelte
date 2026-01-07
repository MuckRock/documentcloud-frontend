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
  import { page } from "$app/stores";

  import NavItem from "$lib/components/common/NavItem.svelte";
  import SignedIn from "$lib/components/common/SignedIn.svelte";

  import { APP_URL } from "@/config/config";
  import { slugify } from "$lib/utils/slugify";
  import { userDocs } from "$lib/utils/search";
  import { getCurrentUser } from "$lib/utils/permissions";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";
  import Button from "$lib/components/common/Button.svelte";

  const me = getCurrentUser();
  const org: Writable<Org> = getContext("org");

  $: query = $page.url.searchParams?.get("q") || "";

  $: mine = $me ? userDocs($me) : "";
  $: minePublic = $me ? userDocs($me, "public") : "";
  $: minePrivate = $me ? userDocs($me, "private") : "";

  $: orgDocs = $org ? `+organization:${slugify($org.name)}-${$org.id}` : "";

  function searchUrl(query: string) {
    const q = new URLSearchParams([["q", query]]);
    const u = new URL("/documents/", APP_URL);

    u.search = q.toString();

    return u.toString();
  }
</script>

<SignedIn>
  <SidebarGroup name="documents">
    <NavItem slot="title">
      <File16 slot="start" />
      {$_("documents.documents")}
    </NavItem>
    <Button
      slot="action"
      ghost
      minW={false}
      mode="primary"
      size="small"
      href="/documents"
    >
      <Search16 height="14" width="14" />
      {$_("common.explore")}
    </Button>
    <NavItem small hover href={searchUrl(mine)} active={query === mine}>
      <Person16 height={14} width={14} slot="start" />
      {$_("documents.yourDocuments")}
    </NavItem>
    <NavItem
      small
      hover
      href={searchUrl(minePrivate)}
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
      href={searchUrl(minePublic)}
      active={query === minePublic}
    >
      <Globe16 height={14} width={14} slot="start" />
      {$_("documents.accessDocuments", {
        values: { access: "Public " },
      })}
    </NavItem>
    {#if $org && !$org.individual}
      <NavItem small hover href={searchUrl(orgDocs)} active={query === orgDocs}>
        <Organization16 height={14} width={14} slot="start" />
        {$_("documents.nameDocuments", {
          values: { name: $org.name, access: "" },
        })}
      </NavItem>
    {/if}
  </SidebarGroup>
  <NavItem slot="signedOut" href={searchUrl('')}>
    <File16 slot="start" />
    {$_("documents.publicDocuments")}
  </NavItem>
</SignedIn>