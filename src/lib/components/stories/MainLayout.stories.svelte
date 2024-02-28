<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import MainLayout from "../MainLayout.svelte";
  import type { Document } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import {
    Globe16,
    Infinity16,
    Lock16,
    Organization16,
    FileDirectory16,
    Pencil16,
    Plug16,
    PlusCircle16,
    Share16,
  } from "svelte-octicons";
  import Button from "$lib/components/common/Button.svelte";
  import SidebarItem from "$lib/components/SidebarItem.svelte";

  import documents from "../../api/fixtures/documents/documents.json";
  import DocumentListItem from "../documents/DocumentListItem.svelte";
  import Flex from "../common/Flex.svelte";

  let docList = documents.results as Document[];

  export const meta = {
    title: "Components / Main Layout",
    component: MainLayout,
    parameters: { layout: "fullscreen" },
  };
</script>

<Template>
  <MainLayout>
    <svelte:fragment slot="navigation">
      <Flex direction="column">
        <SidebarItem hover
          ><Infinity16 /> {$_("projects.allDocuments")}</SidebarItem
        >
        <SidebarItem hover
          ><Globe16 /> {$_("projects.yourPubDocuments")}</SidebarItem
        >
        <SidebarItem hover
          ><Lock16 /> {$_("projects.yourDocuments")}</SidebarItem
        >
        <SidebarItem hover>
          <Organization16 />
          {$_("projects.orgDocuments", {
            values: { name: "MuckRock" },
          })}
        </SidebarItem>
      </Flex>
    </svelte:fragment>
    <svelte:fragment slot="content">
      <Flex direction="column">
        {#each docList as document}
          <DocumentListItem {document} />
        {/each}
      </Flex>
    </svelte:fragment>
    <svelte:fragment slot="action">
      <Button mode="primary"><PlusCircle16 /> Upload Documents</Button>
      <Flex direction="column">
        <SidebarItem hover disabled><Share16 /> Share…</SidebarItem>
        <SidebarItem hover disabled><Pencil16 /> Edit…</SidebarItem>
        <SidebarItem hover disabled><FileDirectory16 /> Organize…</SidebarItem>
        <SidebarItem hover disabled><Plug16 /> Run…</SidebarItem>
      </Flex>
    </svelte:fragment>
  </MainLayout>
</Template>

<Story name="Desktop" />

<Story
  name="Tablet (H)"
  parameters={{
    viewport: { defaultOrientation: "landscape", defaultViewport: "tablet" },
  }}
/>

<Story
  name="Tablet (V)"
  parameters={{
    viewport: { defaultOrientation: "tablet", defaultViewport: "tablet" },
  }}
/>

<Story
  name="Mobile (L)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile2" },
  }}
/>

<Story
  name="Mobile (S)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile1" },
  }}
/>
