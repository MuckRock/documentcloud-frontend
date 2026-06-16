<script lang="ts">
  import { FileDirectoryFill16 } from "svelte-octicons";

  type Project = {
    title: string;
    link: string;
  };

  const { projects }: { projects: Project[] } = $props();
</script>

<ul>
  {#each projects as { title, link }}
    <li>
      <a href={link}>
        <div class="icon">
          <FileDirectoryFill16 />
        </div>
        <span class="title">{title}</span>
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
    color: #000;
    font-family: var(--font-sans);
    font-size: 1rem;
    font-style: normal;
    font-weight: 600;
    line-height: 1.25;
    flex-basis: 100%;
  }

  .count {
    color: rgba(0, 0, 0, 0.7);
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1.43;
    white-space: nowrap;
  }
</style>
