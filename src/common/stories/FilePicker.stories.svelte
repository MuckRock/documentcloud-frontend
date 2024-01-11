<script lang="ts" context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";

  import FilePicker from "../FilePicker.svelte";
  import Button from "../Button.svelte";

  const args = {
    multiselect: false,
  };

  export const meta = {
    title: "Common / File Picker",
    component: FilePicker,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <FilePicker {...args}>
    <Button secondary={true} small={true}>Select Files</Button>
  </FilePicker>
</Template>

<Story name="Single File" {args} />
<Story name="Multiple Files" args={{ ...args, multiselect: true }} />
