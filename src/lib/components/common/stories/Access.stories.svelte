<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Access, { levels } from "../Access.svelte";

  export const meta = {
    title: "Common / Access",
    component: Access,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="Private">
  <Access level={levels[0]} />
</Story>

<Story name="Organization">
  <Access level={levels[1]} />
</Story>

<Story name="Public">
  <Access level={levels[2]} />
</Story>
