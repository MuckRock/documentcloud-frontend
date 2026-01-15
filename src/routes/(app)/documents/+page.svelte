<script lang="ts">
  import { setContext } from "svelte";
  import { _ } from "svelte-i18n";

  import SidebarLayout from "$lib/components/layouts/SidebarLayout.svelte";

  import DocumentActions from "$lib/components/sidebar/DocumentActions.svelte";
  import DocumentNavigation from "$lib/components/sidebar/Documents.svelte";
  import ProjectNavigation from "$lib/components/sidebar/Projects.svelte";
  import AddOnsNavigation from "$lib/components/sidebar/AddOns.svelte";
  import UploadButton from "$lib/components/sidebar/UploadButton.svelte";

  import DocumentBrowser from "$lib/components/layouts/DocumentBrowser.svelte";
  import GuidedTour from "$lib/components/onboarding/GuidedTour.svelte";

  // stores
  import {
    editable,
    selected,
  } from "$lib/components/documents/ResultsList.svelte";

  let { data } = $props();

  setContext("editable", editable);
  setContext("selected", selected);

  let query = $derived(data.query);
</script>

<svelte:head>
  <title>DocumentCloud</title>
</svelte:head>

<SidebarLayout>
  <svelte:fragment slot="navigation">
    <DocumentNavigation />
    <ProjectNavigation />
    <AddOnsNavigation {query} />
  </svelte:fragment>

  <DocumentBrowser slot="content" documents={data.searchResults} {query} />

  <svelte:fragment slot="action">
    <UploadButton />
    <DocumentActions />
  </svelte:fragment>
</SidebarLayout>
<GuidedTour />
