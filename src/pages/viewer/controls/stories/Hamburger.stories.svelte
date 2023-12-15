<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import Hamburger from "../Hamburger.svelte";

  export const meta = {
    title: "Viewer / Controls / Hamburger",
    component: Hamburger,
  };
</script>

<Story name="default">
  <Hamburger on:click />
</Story>
