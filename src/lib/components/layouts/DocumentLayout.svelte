<script lang="ts">
  import type {
    AddOnListItem,
    APIResponse,
    Document,
    DocumentText,
    Page,
    Project,
  } from "$lib/api/types";
  import { _ } from "svelte-i18n";

  import Access, { getLevel } from "../documents/Access.svelte";
  import Actions from "../documents/Actions.svelte";
  import Data from "../documents/Data.svelte";
  import DocumentHeader from "../documents/Header.svelte";
  import DocumentMetadata from "../documents/Metadata.svelte";
  import Flex from "../common/Flex.svelte";
  import Metadata from "../common/Metadata.svelte";
  import Notes from "../documents/sidebar/Notes.svelte";
  import Projects from "../documents/Projects.svelte";
  import Viewer from "../documents/Viewer.svelte";

  import { pdfUrl } from "$lib/api/documents";
  import { getCurrentUser } from "@/lib/utils/permissions";
  import SidebarLayout from "./SidebarLayout.svelte";
  import { isOrg } from "@/api/types/orgAndUser";
  import Avatar from "../accounts/Avatar.svelte";
  import AddOns from "@/lib/components/common/AddOns.svelte";

  const me = getCurrentUser();

  export let document: Document;
  export let asset_url: URL = pdfUrl(document);
  export let text: Promise<DocumentText> | DocumentText;
  export let query: string = "";
  export let action: string = "";
  export let addons: Promise<APIResponse<Page<AddOnListItem>>>;

  $: projects = (document.projects ?? []) as Project[];
</script>

<SidebarLayout>
  <nav class="column" slot="navigation">
    <Projects {projects} {document} />
    <Data {document} />
    <Notes {document} />
  </nav>
  <article slot="content">
    <header><DocumentHeader {document} /></header>
    <main><Viewer {document} {asset_url} {text} {query} /></main>
  </article>
  <aside class="column between" slot="action">
    <Flex direction="column" gap={2}>
      <div style="font-size: var(--font-xl)">
        <Access level={getLevel(document.access)} />
      </div>
      {#if document.access === "organization" && isOrg(document.organization)}
        <Metadata key={$_("sidebar.sharedWith")}>
          <Flex>
            <Avatar org={document.organization} />
            {document.organization.name}
          </Flex>
        </Metadata>
      {/if}
      <Actions {document} user={$me} {action} />

      <AddOns pinnedAddOns={addons} query="+document:{document.id}" />
    </Flex>
    <DocumentMetadata {document} />
  </aside>
</SidebarLayout>

<style>
  article {
    flex: 1 1 auto;
    z-index: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  header {
    padding: 1rem;
  }

  main {
    background: var(--gray-1);
    border: 1px solid var(--gray-2);
    border-radius: var(--radius, 0.5rem);
    box-shadow: inset var(--shadow-2);
  }

  nav,
  aside {
    z-index: 1;
    flex: 1 0 0;
    min-width: 16rem;
    max-width: 18rem;
    height: 100%;
    min-height: 100%;

    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .between {
    justify-content: space-between;
  }
</style>
