<script lang="ts">
  import MainLayout from "@/lib/components/layouts/MainLayout.svelte";
  import ContentLayout from "@/lib/components/layouts/ContentLayout.svelte";
  import Flex from "@/lib/components/common/Flex.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";
  import { File24, Hourglass24, Pencil16, Search16 } from "svelte-octicons";
  import { projectSearchUrl } from "@/lib/utils/search";
  import Empty from "@/lib/components/common/Empty.svelte";
  import DocumentListItem from "@/lib/components/documents/DocumentListItem.svelte";
  import Error from "@/lib/components/common/Error.svelte";

  export let data;

  $: project = data.project;
  $: documents = data.documents;
</script>

<MainLayout>
  <svelte:fragment slot="navigation">
    <Flex direction="column">
      <h1>{project.title}</h1>
      <p>{project.description}</p>
    </Flex>
  </svelte:fragment>

  <ContentLayout slot="content">
    {#await documents}
      <Empty icon={Hourglass24}>Loading project documents…</Empty>
    {:then projectItems}
      {#each projectItems.results as { document }}
        {#if typeof document !== "number"}
          <DocumentListItem {document} />
        {/if}
      {:else}
        <Empty icon={File24}>This project is empty</Empty>
      {/each}
    {:catch}
      <Error>Error loading project documents</Error>
    {/await}
  </ContentLayout>

  <svelte:fragment slot="action">
    <SidebarItem href="edit"><Pencil16 /> Edit</SidebarItem>
    <SidebarItem href={projectSearchUrl(project)}>
      <Search16 /> View in Document Search
    </SidebarItem>
  </svelte:fragment>
</MainLayout>
