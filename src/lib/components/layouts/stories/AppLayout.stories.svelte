<script module lang="ts">
  import type { ComponentProps } from "svelte";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { PlusCircle16 } from "svelte-octicons";

  import AppLayout from "../AppLayout.svelte";
  import AddOns from "$lib/components/sidebar/AddOns.svelte";
  import BulkActions from "$lib/components/sidebar/DocumentActions.svelte";
  import Button from "../../common/Button.svelte";
  import Documents from "$lib/components/sidebar/Documents.svelte";
  import DocumentBrowser from "../DocumentBrowser.svelte";
  import Projects from "$lib/components/sidebar/Projects.svelte";
  import SidebarLayout from "../SidebarLayout.svelte";

  import { documentsList } from "@/test/fixtures/documents";
  import { addons } from "@/test/handlers/addons";
  import { organizations, users } from "@/test/handlers/accounts";
  import { activeAddons } from "@/test/fixtures/addons";

  const documents = Promise.resolve({ data: documentsList });

  type Args = ComponentProps<typeof AppLayout>;

  const { Story } = defineMeta({
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
  });
</script>

{#snippet template(args: Args)}
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
          <PlusCircle16 />Upload
        </Button>
        <BulkActions />
      </svelte:fragment>
    </SidebarLayout>
  </AppLayout>
{/snippet}

<Story name="Desktop" {template} />

<Story
  name="Tablet (H)"
  parameters={{
    viewport: { defaultOrientation: "landscape", defaultViewport: "tablet" },
  }}
  {template}
/>

<Story
  name="Tablet (V)"
  parameters={{
    viewport: { defaultOrientation: "tablet", defaultViewport: "tablet" },
  }}
  {template}
/>

<Story
  name="Mobile (L)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile2" },
  }}
  {template}
/>

<Story
  name="Mobile (S)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile1" },
  }}
  {template}
/>
