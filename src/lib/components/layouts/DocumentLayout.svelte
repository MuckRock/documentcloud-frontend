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

  const user: Writable<User> = getContext("me");

  export let document: Document;
  export let text: Promise<DocumentText> | DocumentText;
  export let query: string = "";
  export let action: string = "";

  $: projects = (document.projects ?? []) as Project[];
</script>

<div class="container">
  <nav>
    <div class="sticky top column">
      <Projects {projects} {document} />
      <Data {document} />
      <Notes {document} />
    </div>
  </nav>
  <article>
    <header>
      <DocumentHeader {document} />
    </header>
    <main class="viewer">
      <Viewer {document} {text} {query} />
    </main>
  </article>
  <aside>
    <div class="sticky top column">
      <Access {document} />
      <Actions {document} user={$user} {action} />
    </div>
    <div class="sticky bottom">
      <Metadata {document} />
    </div>
  </aside>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 18rem minmax(40rem, 1fr) 18rem;
    justify-content: center;
    height: 100%;
    max-width: 100rem;
    margin: 0 auto;
    padding: 0 0.5rem;
    position: relative;
    background: var(--white);
  }

  header {
    padding: 2rem 1.5rem 1rem;
  }

  nav {
    z-index: 1;
    grid-column: 1/2;
    padding: 1rem 1.5rem;
  }

  article {
    z-index: 0;
    grid-column: 2/3;

    margin-bottom: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  main {
    flex: 1 1 auto;

    background: var(--gray-1);
    border: 1px solid var(--gray-2);
    border-radius: 1rem;
    box-shadow: inset var(--shadow-2);
  }

  aside {
    z-index: 1;
    grid-column: 3/4;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    padding: 1rem 1.5rem;
  }

  nav,
  aside {
    padding-top: 3rem;
    top: 3rem;
  }

  .sticky {
    position: sticky;
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sticky.top {
    top: 1rem;
  }

  .sticky.bottom {
    bottom: 2rem;
  }
</style>
