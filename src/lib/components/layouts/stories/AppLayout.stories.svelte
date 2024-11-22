<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import AppLayout from "../AppLayout.svelte";

  import { _ } from "svelte-i18n";

  import DocumentBrowser from "../DocumentBrowser.svelte";
  import SidebarLayout from "../SidebarLayout.svelte";
  import Documents from "@/lib/components/sidebar/Documents.svelte";
  import Projects from "@/lib/components/sidebar/Projects.svelte";
  import Button from "../../common/Button.svelte";
  import { PlusCircle16 } from "svelte-octicons";
  import BulkActions from "@/lib/components/sidebar/DocumentActions.svelte";
  import AddOns from "@/lib/components/sidebar/AddOns.svelte";

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
          },
        },
      },
    },
  };

  const documents = Promise.resolve({ data: documentsList });

  let args = {};
</script>

<Template let:args>
  <AppLayout {...args}>
    <SidebarLayout>
      <svelte:fragment slot="navigation">
        <Documents />
        <Projects />
        <AddOns pinnedAddOns={Promise.resolve({ data: activeAddons })} />
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

<Story name="Desktop" {...args} />

<Story
  name="Tablet (H)"
  parameters={{
    viewport: { defaultOrientation: "landscape", defaultViewport: "tablet" },
  }}
  {...args}
/>

<Story
  name="Tablet (V)"
  parameters={{
    viewport: { defaultOrientation: "tablet", defaultViewport: "tablet" },
  }}
  {...args}
/>

<Story
  name="Mobile (L)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile2" },
  }}
  {...args}
/>

<Story
  name="Mobile (S)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile1" },
  }}
  {...args}
/>
