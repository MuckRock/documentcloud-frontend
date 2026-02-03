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

  let args = {
    progress: 0.5,
  };
</script>

<Story name="With Progress" args={args}>
  <LoadingToolbar {...args} />
</Story>

<Story name="Indeterminate" args={{ ...args, progress: undefined }}>
  <LoadingToolbar progress={undefined} />
</Story>
