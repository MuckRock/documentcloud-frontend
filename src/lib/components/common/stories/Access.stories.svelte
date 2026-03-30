<script context="module" lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Access, { levels } from "../Access.svelte";

  const { Story } = defineMeta({
    title: "Common / Access",
    component: Access,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });
</script>

<Story name="Private" args={{ level: levels[0] }} />
<Story name="Organization" args={{ level: levels[1] }} />
<Story name="Public" args={{ level: levels[2] }} />
