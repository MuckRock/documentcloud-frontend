<script lang="ts" context="module">
  import type { Meta } from "@storybook/svelte";
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import { flatpage, flatpageList } from "@/test/fixtures/flatpages";
  import Flatpage from "../Flatpage.svelte";

  export const meta: Meta = {
    title: "Layout / Flatpage",
    component: Flatpage,
    parameters: {
      layout: "fullscreen",
    },
  };
</script>

<Template let:args>
  <div class="vh vw">
    <Flatpage {...args} />
  </div>
</Template>

<Story name="Search Docs" args={{ ...flatpage }} />

<style>
  .vh {
    height: 100vh;
    width: 100vw;
  }
</style>
