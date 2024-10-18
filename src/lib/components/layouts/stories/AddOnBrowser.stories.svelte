<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import AddOnBrowser from "../AddOnBrowser.svelte";
  import { addonsList, eventsList, runsList } from "@/test/fixtures/addons";

  export const meta = {
    title: "Layout / Add-On Browser",
    component: AddOnBrowser,
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
    addons: Promise.resolve(addonsList),
    events: Promise.resolve(eventsList),
    runs: Promise.resolve(runsList),
  };
</script>

<Template let:args>
  <div class="vh">
    <AddOnBrowser {...args} />
  </div>
</Template>

<Story name="With Data" {args} />

<style>
  .vh {
    height: 100vh;
  }
</style>
