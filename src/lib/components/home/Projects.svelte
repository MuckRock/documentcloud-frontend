<script lang="ts">
  import { FileDirectoryFill16 } from "svelte-octicons";

  const projectData = [
    {
      title: "Epstein files",
      count: 224,
    },
    {
      title: "Archive of inspector generals reports",
      count: 5840,
    },
    {
      title: "Trump pardons",
      count: 97,
    },
  ];
</script>

<ul>
  {#each projectData as project}
    <li>
      <div class="icon">
        <FileDirectoryFill16 />
      </div>
      <span class="title">{project.title}</span>
      <span class="count">
        {project.count.toLocaleString()} documents
      </span>
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
    display: flex;
    align-items: flex-start;
    gap: 16px;
    width: 100%;
    padding: 6px 8px;
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
