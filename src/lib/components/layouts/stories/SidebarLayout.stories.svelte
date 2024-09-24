<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import { _ } from "svelte-i18n";
  import { PlusCircle16 } from "svelte-octicons";

  import SidebarLayout from "../SidebarLayout.svelte";
  import DocumentBrowser from "../DocumentBrowser.svelte";
  import Button from "$lib/components/common/Button.svelte";

  import Actions from "@/routes/(app)/documents/sidebar/Actions.svelte";
  import AddOns from "@/lib/components/common/AddOns.svelte";
  import Documents from "@/routes/(app)/documents/sidebar/Documents.svelte";
  import Projects from "@/routes/(app)/documents/sidebar/Projects.svelte";

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

  let args = {};
</script>

<Template let:args>
  <div class="vh-100 vw-100">
    <SidebarLayout {...args}>
      <svelte:fragment slot="navigation">
        <Documents />
        <Projects />
      </svelte:fragment>
      <svelte:fragment slot="content">
        <DocumentBrowser documents={Promise.resolve(documentsList)} />
      </svelte:fragment>
      <svelte:fragment slot="action">
        <Button mode="primary" href="/upload/">
          <PlusCircle16 />{$_("sidebar.upload")}
        </Button>
        <Actions />
        <AddOns pinnedAddOns={Promise.resolve(activeAddons)} />
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
