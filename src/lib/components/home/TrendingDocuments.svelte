<!--
@component
A compact list of the currently trending documents, shown on the homepage to
help visitors discover popular content. Mirrors the layout of Projects.svelte.
-->
<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { File16 } from "svelte-octicons";

  import { canonicalUrl } from "$lib/api/documents";

  const { documents }: { documents: Document[] } = $props();
</script>

<ul>
  {#each documents as document}
    <li>
      <a href={canonicalUrl(document).href}>
        <div class="icon">
          <File16 />
        </div>
        <span class="title">{document.title}</span>
      </a>
    </li>
  {/each}
</ul>

<style>
  ul {
    display: flex;
    padding: 0.5rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    align-self: stretch;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2);
  }

  li {
    list-style: none;
    width: 100%;
  }

  a {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 0.375rem 0.5rem;
    border-radius: 0.25rem;
    text-decoration: none;
  }

  a:hover {
    background-color: var(--blue-1);
  }

  .icon {
    flex-basis: 1rem;
    height: 1rem;
    margin: 0.125rem;
    fill: var(--blue-3);
  }

  .title {
    color: var(--black, #000);
    font-family: var(--font-sans);
    font-size: 1rem;
    font-style: normal;
    font-weight: 600;
    line-height: 1.25;
    flex-basis: 100%;
  }
</style>
