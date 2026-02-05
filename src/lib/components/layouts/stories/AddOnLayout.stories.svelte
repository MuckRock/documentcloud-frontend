<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AddOnLayout from "../AddOnLayout.svelte";

  import { documentsList } from "@/test/fixtures/documents";
  import { addon, event } from "@/test/fixtures/addons";

  let args = {
    addon,
    query: "",
    search: Promise.resolve(documentsList),
  };

  const { Story } = defineMeta({
    title: "Layout / Add-On Layout",
    component: AddOnLayout,
    parameters: {
      layout: "fullscreen",
      sveltekit_experimental: {
        stores: {
          page: {
            url: "/",
          },
        },
      },
    },
  });
</script>

<script lang="ts">
  import { writable } from "svelte/store";
  import { setContext } from "svelte";
  import {
    defaultVisibleFields,
    setVisibleFieldsContext,
  } from "$lib/components/documents/VisibleFields.svelte";

  // Set up contexts needed by ResultsList (used in AddOnLayout -> DocumentList)
  setContext("embed", false);
  setVisibleFieldsContext(writable(defaultVisibleFields));
</script>

{#snippet template(args)}
  <div class="vh">
    <AddOnLayout {...args} />
  </div>
{/snippet}

<Story name="With Documents" {args} {template} />

<Story
  name="Without Documents"
  args={{
    ...args,
    addon: {
      ...addon,
      parameters: {
        ...addon.parameters,
        documents: undefined,
      },
    },
  }}
  {template}
/>

<Story name="With Event" args={{ ...args, event }} {template} />

<Story
  name="Mobile Layout"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile2" },
  }}
  {args}
  {template}
/>

<style>
  .vh {
    height: 100vh;
  }
</style>
