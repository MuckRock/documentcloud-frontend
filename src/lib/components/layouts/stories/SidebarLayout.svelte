<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import SidebarLayout from "../SidebarLayout.svelte";
  import type { DocumentResults } from "$lib/api/types";

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
    Book16,
  } from "svelte-octicons";
  import Button from "$lib/components/common/Button.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";

  import documents from "@/test/fixtures/documents/documents.json";
  import Flex from "../../common/Flex.svelte";
  import SidebarGroup from "../../sidebar/SidebarGroup.svelte";
  import Action from "../../common/Action.svelte";
  import Pin from "@/common/Pin.svelte";
  import ResultsList from "../../documents/ResultsList.svelte";
  import ContentLayout from "../ContentLayout.svelte";
  import PageToolbar from "../../common/PageToolbar.svelte";
  import Search from "../../forms/Search.svelte";

  import { addons } from "@/test/handlers/addons";

  let results = documents as DocumentResults;

  export const meta = {
    title: "Layout / Sidebar",
    component: SidebarLayout,
    parameters: {
      layout: "fullscreen",
      msw: {
        handlers: [addons.data],
      },
      sveltekit_experimental: {
        stores: {
          page: {
            url: "/",
          },
        },
      },
    },
  };

  let args = {};
</script>

<script>
  import Dialog from "./Dialog.demo.svelte";
  import Modal from "../Modal.svelte";
  import Portal from "../Portal.svelte";

  let modalOpen = false;
</script>

<Template let:args>
  <SidebarLayout {...args}>
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
      <SidebarGroup>
        <SidebarItem slot="title"><FileDirectory16 /> Projects</SidebarItem>
        <Action slot="action" icon={Book16}>Explore</Action>
        <Flex direction="column" gap={0}>
          <SidebarItem small href="/project/1">
            <Pin active /> Oldest Computer
          </SidebarItem>
          <SidebarItem small href="/project/2">
            <Pin active /> FBI Files
          </SidebarItem>
          <SidebarItem small href="/project/3">
            <Pin active /> 1033 Project
          </SidebarItem>
        </Flex>
      </SidebarGroup>
    </svelte:fragment>
    <ContentLayout slot="content">
      <PageToolbar slot="header">
        <Search slot="center" />
      </PageToolbar>
      <ResultsList results={results.results} />

      <PageToolbar slot="footer">
        <svelte:fragment slot="center">
          <Button
            disabled={modalOpen}
            ghost
            mode="primary"
            on:click={() => (modalOpen = true)}
          >
            Open modal
          </Button>
          {#if modalOpen}
            <Portal>
              <Modal on:close={() => (modalOpen = false)}>
                <h1 slot="title">Chowder.</h1>
                <Dialog />
              </Modal>
            </Portal>
          {/if}
        </svelte:fragment>
      </PageToolbar>
    </ContentLayout>
    <svelte:fragment slot="action">
      <Button mode="primary"><PlusCircle16 /> Upload Documents</Button>
      <Flex direction="column">
        <SidebarItem hover disabled><Share16 /> Share…</SidebarItem>
        <SidebarItem hover disabled><Pencil16 /> Edit…</SidebarItem>
        <SidebarItem hover disabled><FileDirectory16 /> Organize…</SidebarItem>
        <SidebarItem hover disabled><Plug16 /> Run…</SidebarItem>
      </Flex>
      <SidebarGroup>
        <SidebarItem slot="title"><Plug16 /> Add-Ons</SidebarItem>
        <Action slot="action" icon={Book16}>Explore</Action>
        <Flex direction="column" gap={0}>
          <SidebarItem small href="/addon/1">
            <Pin active /> Scraper
          </SidebarItem>
          <SidebarItem small href="/addon/2">
            <Pin active /> Regex Extractor
          </SidebarItem>
          <SidebarItem small href="/addon/3">
            <Pin active /> Tabula Spreadsheet Analysis
          </SidebarItem>
          <SidebarItem small href="/addon/4">
            <Pin active /> GPT 3.5 Analysis
          </SidebarItem>
        </Flex>
      </SidebarGroup>
    </svelte:fragment>
  </SidebarLayout>
</Template>

<Story name="Desktop" {...args} />
