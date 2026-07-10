<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Flatpage from "../Flatpage.svelte";

  import { flatpage } from "@/test/fixtures/flatpages";

  const { Story } = defineMeta({
    title: "Layout / Flatpage",
    component: Flatpage,
    parameters: {
      layout: "fullscreen",
    },
  });
</script>

{#snippet template(args)}
  <div class="vh vw">
    <Flatpage {...args} />
  </div>
{/snippet}

<Story name="Search Docs" args={{ ...flatpage }} {template} />

<style>
  .vh {
    height: 100vh;
    width: 100vw;
  }
</style>
