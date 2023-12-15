<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import ViewDropdown from "../ViewDropdown.svelte";

  export const meta = {
    title: "Viewer / Controls / View Dropdown",
    component: ViewDropdown,
  };
</script>

<Story name="default">
  <ViewDropdown />
</Story>
