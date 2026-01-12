<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import AppLayout from "../AppLayout.svelte";

  import { _ } from "svelte-i18n";
  import { PlusCircle16 } from "svelte-octicons";

  import DocumentBrowser from "../DocumentBrowser.svelte";
  import SidebarLayout from "../SidebarLayout.svelte";
  import Documents from "$lib/components/sidebar/Documents.svelte";
  import Projects from "$lib/components/sidebar/Projects.svelte";
  import Button from "../../common/Button.svelte";
  import BulkActions from "$lib/components/sidebar/DocumentActions.svelte";
  import AddOns from "$lib/components/sidebar/AddOns.svelte";

  import { documentsList } from "@/test/fixtures/documents";
  import { addons } from "@/test/handlers/addons";
  import { organizations, users } from "@/test/handlers/accounts";
  import { activeAddons } from "@/test/fixtures/addons";

  export const meta = {
    title: "Layout / App",
    component: AppLayout,
    parameters: {
      layout: "fullscreen",
      msw: {
        handlers: [addons.data, organizations.data, users.data],
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
  };

  const documents = Promise.resolve({ data: documentsList });
</script>

<Template let:args>
  <AppLayout {...args}>
    <SidebarLayout>
      <svelte:fragment slot="navigation">
        <Documents />
        <Projects />
        <AddOns />
      </svelte:fragment>

      <DocumentBrowser slot="content" {documents} />

      <svelte:fragment slot="action">
        <Button mode="primary" href="/upload/">
          <PlusCircle16 />{$_("sidebar.upload")}
        </Button>
        <BulkActions />
      </svelte:fragment>
    </SidebarLayout>
  </AppLayout>
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
