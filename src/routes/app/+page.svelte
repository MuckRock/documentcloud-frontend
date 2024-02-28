<script lang="ts">
  import { _ } from "svelte-i18n";
  import {
    Globe16,
    Infinity16,
    Lock16,
    Organization16,
    FileDirectory16,
    Pencil16,
    Plug16,
    PlusCircle16,
    Share16,
  } from "svelte-octicons";
  import Button from "$lib/components/common/Button.svelte";
  import MainLayout from "$lib/components/MainLayout.svelte";
  import SidebarItem from "$lib/components/SidebarItem.svelte";

  export let data;

  $: searchResults = data.searchResults;

  // local utils

  function path(url: URL | string) {
    url = new URL(url);

    return url.pathname;
  }
</script>

<MainLayout>
  <svelte:fragment slot="navigation">
    <SidebarItem><Infinity16 /> {$_("projects.allDocuments")}</SidebarItem>
    <SidebarItem><Globe16 /> {$_("projects.yourPubDocuments")}</SidebarItem>
    <SidebarItem><Lock16 /> {$_("projects.yourDocuments")}</SidebarItem>
    <SidebarItem
      ><Organization16 />
      {$_("projects.orgDocuments", {
        values: { name: "MuckRock" },
      })}</SidebarItem
    >
  </svelte:fragment>
  <svelte:fragment slot="content">
    {searchResults}
  </svelte:fragment>
  <svelte:fragment slot="action">
    <Button mode="primary"><PlusCircle16 /> Upload Documents</Button>
    <SidebarItem disabled><Share16 /> Share…</SidebarItem>
    <SidebarItem disabled><Pencil16 /> Edit…</SidebarItem>
    <SidebarItem disabled><FileDirectory16 /> Organize…</SidebarItem>
    <SidebarItem disabled><Plug16 /> Run…</SidebarItem>
  </svelte:fragment>
</MainLayout>
