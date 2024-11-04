<!-- @component
  Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
  import type {
    AddOnListItem,
    APIResponse,
    Page,
    Project,
  } from "$lib/api/types";
  import { _ } from "svelte-i18n";

  import Actions from "../documents/Actions.svelte";
  import AddOns from "$lib/components/common/AddOns.svelte";
  import Avatar from "../accounts/Avatar.svelte";
  import Data from "../documents/Data.svelte";
  import DocumentHeader from "../documents/Header.svelte";
  import DocumentMetadata from "../documents/Metadata.svelte";
  import Flex from "../common/Flex.svelte";
  import Metadata from "../common/Metadata.svelte";
  import Notes from "../documents/sidebar/Notes.svelte";
  import Projects from "../documents/Projects.svelte";
  import SidebarLayout from "./SidebarLayout.svelte";
  import Viewer from "../viewer/Viewer.svelte";

  import { getCurrentUser } from "$lib/utils/permissions";
  import { isOrg } from "@/api/types/orgAndUser";
  import { getDocument, getText } from "../viewer/ViewerContext.svelte";

  const me = getCurrentUser();

  export let documentStore = getDocument();
  export let text = getText();
  export let action: string = "";
  export let addons: Promise<APIResponse<Page<AddOnListItem>>>;

  $: document = $documentStore;
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
    <main><Viewer /></main>
  </article>

  <aside class="column between" slot="action">
    <Flex direction="column" gap={2}>
      {#if document.access === "organization" && isOrg(document.organization)}
        <Metadata key={$_("sidebar.sharedWith")}>
          <Flex>
            <Avatar org={document.organization} />
            {document.organization.name}
          </Flex>
        </Metadata>
      {/if}
      {#if $me}
        <Actions {document} user={$me} {action} />
      {/if}

      <AddOns pinnedAddOns={addons} query="+document:{document.id}" />
    </Flex>
    <DocumentMetadata {document} {text} />
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
