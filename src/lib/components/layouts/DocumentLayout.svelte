<script lang="ts">
  import type { Document, DocumentText, Project, User } from "$lib/api/types";
  import type { Writable } from "svelte/store";
  import Access from "../documents/Access.svelte";
  import Actions from "../documents/Actions.svelte";
  import Data from "../documents/Data.svelte";
  import DocumentHeader from "../documents/Header.svelte";
  import Metadata from "../documents/Metadata.svelte";
  import Projects from "../documents/Projects.svelte";
  import Notes from "../documents/sidebar/Notes.svelte";
  import Viewer from "../documents/Viewer.svelte";
  import { getContext } from "svelte";
  import Flex from "../common/Flex.svelte";

  const user: Writable<User> = getContext("me");

  export let document: Document;
  export let text: Promise<DocumentText> | DocumentText;
  export let query: string = "";
  export let action: string = "";

  $: projects = (document.projects ?? []) as Project[];
</script>

<div class="container">
  <nav class="column">
    <Projects {projects} {document} />
    <Data {document} />
    <Notes {document} />
  </nav>
  <article>
    <header>
      <DocumentHeader {document} />
    </header>
    <main class="viewer">
      <Viewer {document} {text} {query} />
    </main>
  </article>
  <aside class="column between">
    <Flex direction="column" gap={2}>
      <Access {document} />
      <Actions {document} user={$user} {action} />
    </Flex>
    <Metadata {document} />
  </aside>
</div>

<style>
  .container {
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: var(--app-max-w, 100rem);
    max-height: 100%;
    margin: 0 auto;
    position: relative;
  }

  header {
    padding: 2rem 1.5rem 1rem;
  }

  article {
    flex: 1 1 auto;
    z-index: 0;
    padding-bottom: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow-y: auto;
  }

  main {
    flex: 1 1 auto;

    background: var(--gray-1);
    border: 1px solid var(--gray-2);
    border-radius: 1rem;
    box-shadow: inset var(--shadow-2);
  }

  nav,
  aside {
    z-index: 1;
    width: 16rem;
    flex: 0 0 auto;

    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 100%;
    padding: 4rem 1rem 1rem;
    overflow-y: auto;
  }

  .between {
    justify-content: space-between;
  }
</style>
