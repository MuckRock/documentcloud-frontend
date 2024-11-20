<script lang="ts">
  import { setContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { PlusCircle16 } from "svelte-octicons";

  import AddOns from "$lib/components/common/AddOns.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import SignedIn from "$lib/components/common/SignedIn.svelte";
  import SidebarLayout from "$lib/components/layouts/SidebarLayout.svelte";

  import BulkActions from "@/lib/components/documents/BulkActions.svelte";
  import Documents from "../documents/sidebar/Documents.svelte";
  import Projects from "../documents/sidebar/Projects.svelte";

  import DocumentBrowser from "$lib/components/layouts/DocumentBrowser.svelte";
  import GuidedTour from "$lib/components/onboarding/GuidedTour.svelte";

  import {
    canUploadFiles,
    getCurrentUser,
    isSignedIn,
  } from "$lib/utils/permissions";

  // stores
  import { selected } from "$lib/components/documents/ResultsList.svelte";

  export let data;

  setContext("selected", selected);

  const me = getCurrentUser();

  $: query = data.query;
</script>

<svelte:head>
  <title>DocumentCloud</title>
</svelte:head>

<SidebarLayout>
  <svelte:fragment slot="navigation">
    <Documents />
    <SignedIn>
      <Projects />
    </SignedIn>
  </svelte:fragment>

  <DocumentBrowser slot="content" documents={data.searchResults} {query} />

  <svelte:fragment slot="action">
    {#if isSignedIn($me)}
      {#if canUploadFiles($me)}
        <Button mode="primary" href="/upload/">
          <PlusCircle16 />{$_("sidebar.upload")}
        </Button>
      {/if}
      <BulkActions />
      <AddOns pinnedAddOns={data.pinnedAddons} {query} />
    {/if}
  </svelte:fragment>
</SidebarLayout>
<GuidedTour />
