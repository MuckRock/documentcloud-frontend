<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import AddOnLayout from "../AddOnLayout.svelte";

  import { document, documentsList } from "@/test/fixtures/documents";
  import { addon, event } from "@/test/fixtures/addons";

  export const meta = {
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
  };

  let args = {
    addon,
    query: "",
    search: Promise.resolve(documentsList),
  };
</script>

<Template let:args>
  <div class="vh">
    <AddOnLayout {...args} />
  </div>
</Template>

<Story name="With Documents" {args} />

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
/>

<Story name="With Event" args={{ ...args, event }} />

<Story
  name="Mobile Layout"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile2" },
  }}
  {args}
/>

<style>
  .vh {
    height: 100vh;
  }
</style>
