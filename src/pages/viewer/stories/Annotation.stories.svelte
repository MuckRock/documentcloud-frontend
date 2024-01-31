<script context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Annotation from "../Annotation.svelte";

  export const meta = {
    title: "Viewer / Annotation",
    component: Annotation,
    parameters: { layout: "center" },
  };
</script>

<Template let:args>
  <Annotation {...args} />
</Template>

<Story name="default" />
