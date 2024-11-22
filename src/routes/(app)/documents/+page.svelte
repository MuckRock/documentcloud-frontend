<script lang="ts">
  import { setContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { PlusCircle16 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import SignedIn from "$lib/components/common/SignedIn.svelte";
  import SidebarLayout from "$lib/components/layouts/SidebarLayout.svelte";

  import DocumentActions from "@/lib/components/sidebar/DocumentActions.svelte";
  import DocumentNavigation from "$lib/components/sidebar/Documents.svelte";
  import ProjectNavigation from "$lib/components/sidebar/Projects.svelte";
  import AddOnsNavigation from "@/lib/components/sidebar/AddOns.svelte";

  import DocumentBrowser from "$lib/components/layouts/DocumentBrowser.svelte";
  import GuidedTour from "$lib/components/onboarding/GuidedTour.svelte";

  import {
    canUploadFiles,
    getCurrentUser,
    isSignedIn,
  } from "$lib/utils/permissions";

  // stores
  import { selected } from "$lib/components/documents/ResultsList.svelte";
  import UploadButton from "@/lib/components/sidebar/UploadButton.svelte";

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
    <DocumentNavigation />
    <SignedIn>
      <ProjectNavigation />
    </SignedIn>
    <AddOnsNavigation pinnedAddOns={data.pinnedAddons} {query} />
  </svelte:fragment>

  <DocumentBrowser slot="content" documents={data.searchResults} {query} />

  <svelte:fragment slot="action">
    {#if isSignedIn($me)}
      <UploadButton />
      <DocumentActions />
    {/if}
  </svelte:fragment>
</SidebarLayout>
<GuidedTour />
