<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import Paginator from "../Paginator.svelte";

  export const meta = {
    title: "Viewer / Controls / Paginator",
    component: Paginator,
  };
</script>

<Story name="default">
  <Paginator />
</Story>
