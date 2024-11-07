<script lang="ts">
  import type { Org } from "$lib/api/types";
  import type { Writable } from "svelte/store";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    File16,
    Globe16,
    Infinity16,
    Lock16,
    Organization16,
  } from "svelte-octicons";
  import { page } from "$app/stores";

  import Flex from "$lib/components/common/Flex.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";
  import SignedIn from "$lib/components/common/SignedIn.svelte";

  import { APP_URL } from "@/config/config";
  import { slugify } from "@/util/string.js";
  import { userDocs } from "$lib/utils/search";
  import { getCurrentUser } from "@/lib/utils/permissions";

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

<Flex direction="column">
  <SidebarItem hover href={searchUrl("")} active={query === ""}>
    <Infinity16 slot="start" />
    {$_("documents.allDocuments", {
      values: { access: "" },
    })}
  </SidebarItem>

  <SignedIn>
    <SidebarItem hover href={searchUrl(mine)} active={query === mine}>
      <File16 slot="start" />
      {$_("documents.yourDocuments")}
    </SidebarItem>

    <SidebarItem
      hover
      href={searchUrl(minePublic)}
      active={query === minePublic}
    >
      <Globe16 slot="start" />
      {$_("documents.accessDocuments", {
        values: { access: "Public " },
      })}
    </SidebarItem>
    <SidebarItem
      hover
      href={searchUrl(minePrivate)}
      active={query === minePrivate}
    >
      <Lock16 slot="start" />
      {$_("documents.accessDocuments", {
        values: { access: "Private " },
      })}
    </SidebarItem>
    {#if $org && !$org.individual}
      <SidebarItem hover href={searchUrl(orgDocs)} active={query === orgDocs}>
        <Organization16 slot="start" />
        {$_("documents.nameDocuments", {
          values: { name: $org.name, access: "" },
        })}
      </SidebarItem>
    {/if}
  </SignedIn>
</Flex>
