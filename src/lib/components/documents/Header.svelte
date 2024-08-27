<script lang="ts">
  import type { Document, Project } from "$lib/api/types";

  import { _ } from "svelte-i18n";

  import Flex from "$lib/components/common/Flex.svelte";

  import Data from "./Data.svelte";
  import Projects from "./Projects.svelte";

  export let document: Document;

  $: projects = (document.projects ?? []) as Project[];
</script>

<!--
  @component
  Document top-matter:

  - title
  - description
  - tags & data
  - projects
-->
<Flex direction="column" gap={2}>
  <header>
    <h1>{document.title}</h1>
    {#if document.description}
      <div class="description">
        {@html document.description}
      </div>
    {/if}
    <Flex>
      <Data {document} />
      <Projects {projects} />
    </Flex>
  </header>
</Flex>

<style>
  header h1 {
    display: inline;
    overflow-wrap: break-word;
    font-weight: var(--font-semibold);
    font-size: calc(1.25 * var(--font-xl));
    line-height: 1.2;
  }
  header {
    max-width: 64rem;
    display: flex;
    flex-direction: column;
    gap: 1rem 0;
  }
  .description {
    columns: 2;
    color: var(--gray-5);
  }
  :global(.description > *) {
    margin-bottom: 1rem;
  }
</style>
