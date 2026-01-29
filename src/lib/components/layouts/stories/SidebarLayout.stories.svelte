<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

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

  const documents = Promise.resolve({ data: documentsList });

  const { Story } = defineMeta({
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
            data: {
              pinnedAddons: Promise.resolve({ data: activeAddons }),
            },
          },
        },
      },
    },
  });
</script>

{#snippet template(args)}
  <div class="vh-100 vw-100">
    <SidebarLayout {...args}>
      <svelte:fragment slot="navigation">
        <DocumentsNavigation />
        <ProjectsNavigation />
        <AddOnsNavigation />
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
{/snippet}

<Story name="Desktop" {template} />

<style>
  .vh-100 {
    height: 100vh;
  }

  .vw-100 {
    width: 100vw;
  }
</style>
