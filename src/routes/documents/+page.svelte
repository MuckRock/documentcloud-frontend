<script lang="ts">
  import { _ } from "svelte-i18n";
  import { PlusCircle16 } from "svelte-octicons";

  import { deleted } from "$lib/api/documents";
  import type { DocumentResults } from "$lib/api/types";

  import Button from "$lib/components/common/Button.svelte";
  import SignedIn from "$lib/components/common/SignedIn.svelte";
  import SidebarLayout from "$lib/components/layouts/SidebarLayout.svelte";

  import Actions from "../documents/sidebar/Actions.svelte";
  import AddOns from "../documents/sidebar/AddOns.svelte";
  import Documents from "../documents/sidebar/Documents.svelte";
  import Projects from "../documents/sidebar/Projects.svelte";

  import DocumentBrowser from "@/lib/components/layouts/DocumentBrowser.svelte";

  export let data;

  $: searchResults =
    $deleted.size > 0
      ? data.searchResults.then((r) => excludeDeleted(r, $deleted))
      : data.searchResults;
  $: query = data.query;
  $: pending = data.pending;

  // filter out deleted documents that haven't been purged from search yet
  function excludeDeleted(
    searchResults: DocumentResults,
    deleted: Set<string>,
  ): DocumentResults {
    const filtered = searchResults.results.filter(
      (d) => !deleted.has(String(d.id)),
    );

    return {
      ...searchResults,
      results: filtered,
      count: searchResults.count - deleted.size,
    };
  }
</script>

<SidebarLayout>
  <svelte:fragment slot="navigation">
    <Documents />
    <SignedIn>
      <Projects />
    </SignedIn>
  </svelte:fragment>

  <DocumentBrowser slot="content" documents={searchResults} {query} {pending} />

  <svelte:fragment slot="action">
    <SignedIn>
      <Button mode="primary" href="/upload/">
        <PlusCircle16 />{$_("sidebar.upload")}
      </Button>
      <Actions />
      <AddOns pinnedAddOns={data.pinnedAddons} />
    </SignedIn>
  </svelte:fragment>
</SidebarLayout>
