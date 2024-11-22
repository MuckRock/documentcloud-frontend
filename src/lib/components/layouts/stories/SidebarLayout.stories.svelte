<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import { _ } from "svelte-i18n";

  import SidebarLayout from "../SidebarLayout.svelte";
  import DocumentBrowser from "../DocumentBrowser.svelte";
  import UploadButton from "$lib/components/sidebar/UploadButton.svelte";
  import DocumentActions from "$lib/components/sidebar/DocumentActions.svelte";
  import AddOnsNavigation from "$lib/components/sidebar/AddOns.svelte";
  import DocumentsNavigation from "$lib/components/sidebar/Documents.svelte";
  import ProjectsNavigation from "$lib/components/sidebar/Projects.svelte";

  import { documentsList } from "@/test/fixtures/documents";
  import { activeAddons } from "@/test/fixtures/addons";
  import { addons } from "@/test/handlers/addons";

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

  const documents = Promise.resolve({ data: documentsList });

  let args = {};
</script>

<Template let:args>
  <div class="vh-100 vw-100">
    <SidebarLayout {...args}>
      <svelte:fragment slot="navigation">
        <DocumentsNavigation />
        <ProjectsNavigation />
        <AddOnsNavigation
          pinnedAddOns={Promise.resolve({ data: activeAddons })}
        />
      </svelte:fragment>
      <svelte:fragment slot="content">
        <DocumentBrowser {documents} />
      </svelte:fragment>
      <svelte:fragment slot="action">
        <UploadButton />
        <DocumentActions />
      </svelte:fragment>
    </SidebarLayout>
  </div>
</Template>

<Story name="Desktop" {...args} />

<style>
  .vh-100 {
    height: 100vh;
  }

  .vw-100 {
    width: 100vw;
  }
</style>
