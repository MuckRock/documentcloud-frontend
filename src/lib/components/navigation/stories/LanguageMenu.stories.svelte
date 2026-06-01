<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import LanguageMenu from "../LanguageMenu.svelte";

  const { Story } = defineMeta({
    title: "Navigation / Language Menu",
    component: LanguageMenu,
    parameters: { layout: "centered" },
  });
</script>

<Story name="Language" />
