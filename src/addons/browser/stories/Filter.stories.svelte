<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Filter from "../Filter.svelte";
  import Star from "../../../common/icons/Star.svelte";

  let args = { selected: false, name: "Pinned" };

  export const meta = {
    title: "Add-Ons / Browser / Components / Filter",
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    component: Filter,
    argTypes: { selected: { control: "boolean" } },
  };
</script>

<Template let:args>
  <Filter {...args}>
    <Star slot="icon" />
  </Filter>
</Template>

<Story name="Default" {args} />
<Story name="Selected" args={{ ...args, selected: true }} />
