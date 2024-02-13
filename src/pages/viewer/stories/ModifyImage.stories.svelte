<script context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import ModifyImage from "../ModifyImage.svelte";

  import { Document } from "@/structure/document.js";
  import { viewer } from "@/viewer/viewer.js";
  import { ModificationDescriptor } from "@/viewer/modification/modifySpec.js";

  import document from "../fixtures/document.json";

  viewer.doc = new Document(document);

  export const meta = {
    title: "Viewer / Modify Image",
    component: ModifyImage,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  const MAX_THUMB_WIDTH = 84;
  const MAX_THUMB_HEIGHT = 119;

  const args = {
    id: document.id,
    size: 140,
    maxThumb: [MAX_THUMB_WIDTH, MAX_THUMB_HEIGHT],
    descriptor: new ModificationDescriptor(),
  };
</script>

<Template let:args>
  <ModifyImage {...args} />
</Template>

<Story name="default" {args} />
