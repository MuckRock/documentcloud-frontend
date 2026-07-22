<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AddOnBrowser from "../AddOnBrowser.svelte";
  import { addonsList, eventsList, runsList } from "@/test/fixtures/addons";

  const { Story } = defineMeta({
    title: "Layout / Add-On Browser",
    component: AddOnBrowser,
    parameters: {
      layout: "fullscreen",
      sveltekit_experimental: {
        state: {
          page: {
            url: new URL("https://www.documentcloud.org/"),
          },
        },
      },
    },
  });

  const args = {
    addons: Promise.resolve({ data: addonsList }),
    events: Promise.resolve({ data: eventsList }),
    runs: Promise.resolve({ data: runsList }),
  };
</script>

{#snippet template(args)}
  <div class="vh">
    <AddOnBrowser {...args} />
  </div>
{/snippet}

<Story name="With Data" {args} {template} />

<style>
  .vh {
    height: 100vh;
  }
</style>
