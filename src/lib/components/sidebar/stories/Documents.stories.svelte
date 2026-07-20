<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Documents from "../Documents.svelte";

  const { Story } = defineMeta({
    title: "Navigation / Documents",
    component: Documents,
    parameters: { layout: "centered" },
  });
</script>

<Story name="Signed In" />

<Story
  name="Signed Out"
  parameters={{
    sveltekit_experimental: { state: { page: { data: { me: undefined } } } },
  }}
/>
