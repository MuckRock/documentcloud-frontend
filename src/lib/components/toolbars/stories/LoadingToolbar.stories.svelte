<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LoadingToolbar from "../LoadingToolbar.svelte";

  const { Story } = defineMeta({
    title: "Toolbars / Loading",
    component: LoadingToolbar,
    parameters: {
      layout: "fullscreen",
    },
  });
</script>

<Story name="With Progress" args={{ progress: 0.5 }} />
<Story name="Indeterminate" args={{ progress: undefined }} />
