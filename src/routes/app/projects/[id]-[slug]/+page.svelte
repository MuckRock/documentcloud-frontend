<script lang="ts">
  import {
    File24,
    Hourglass24,
    Pencil16,
    People16,
    Search16,
    Share16,
  } from "svelte-octicons";

  import MainLayout from "@/lib/components/layouts/MainLayout.svelte";
  import ContentLayout from "@/lib/components/layouts/ContentLayout.svelte";
  import Divider from "@/lib/components/common/Divider.svelte";
  import Flex from "@/lib/components/common/Flex.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";
  import Empty from "@/lib/components/common/Empty.svelte";
  import Error from "@/lib/components/common/Error.svelte";
  import DocumentListItem from "@/lib/components/documents/DocumentListItem.svelte";
  import { projectSearchUrl } from "@/lib/utils/search";

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
      <div>
        {#each projectItems.results as { document }}
          {#if typeof document !== "number"}
            <DocumentListItem {document} />
          {/if}
        {:else}
          <Empty icon={File24}>This project has no documents.</Empty>
        {/each}
      </div>
    {:catch}
      <Error>Error loading project documents</Error>
    {/await}
  </ContentLayout>

  <svelte:fragment slot="action">
    <Flex direction="column">
      <SidebarItem href="#edit"><Pencil16 /> Edit</SidebarItem>
      <SidebarItem href="#collaborate"
        ><People16 /> Manage Collaborators</SidebarItem
      >
      <SidebarItem href="#share"><Share16 /> Share & Embed</SidebarItem>
    </Flex>
    <Divider />
    <SidebarItem href={projectSearchUrl(project)}>
      <Search16 /> View in Document Search
    </SidebarItem>
  </svelte:fragment>
</MainLayout>
