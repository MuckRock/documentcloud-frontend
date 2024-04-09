<script lang="ts">
  import type { User, Org } from "@/api/types/orgAndUser";
  import type { Writable } from "svelte/store";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { Globe16, Infinity16, Lock16, Organization16 } from "svelte-octicons";

  import Flex from "$lib/components/common/Flex.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";
  import SignedIn from "$lib/components/common/SignedIn.svelte";

  import { APP_URL } from "@/config/config";
  import { slugify } from "@/util/string.js";

  const me: Writable<User> = getContext("me");
  const org: Writable<Org> = getContext("org");

  // +user:chris-amico-1020 +access:public
  $: mine = $me ? `+user:${slugify($me.name)}-${$me.id}` : "";
  $: minePublic = `${mine} +access:public`;
  $: minePrivate = `${mine} +access:private`;

  // +organization:muckrock-125
  $: orgDocs = $org ? `+organization:${slugify($org.name)}-${$org.id}` : "";

  function searchUrl(query: string) {
    const q = new URLSearchParams([["q", query]]);
    const u = new URL("/app/", APP_URL);

    u.search = q.toString();

    return u.toString();
  }
</script>

<Flex direction="column">
  <SidebarItem hover href={searchUrl("")}
    ><Infinity16 /> {$_("projects.allDocuments")}</SidebarItem
  >
  <SignedIn>
    <SidebarItem hover href={searchUrl(minePublic)}
      ><Globe16 /> {$_("projects.yourPubDocuments")}</SidebarItem
    >
    <SidebarItem hover href={searchUrl(minePrivate)}
      ><Lock16 /> {$_("projects.yourDocuments")}</SidebarItem
    >
    <SidebarItem hover href={searchUrl(orgDocs)}>
      <Organization16 />
      {$_("projects.orgDocuments", {
        values: { name: "MuckRock" },
      })}
    </SidebarItem>
  </SignedIn>
</Flex>
