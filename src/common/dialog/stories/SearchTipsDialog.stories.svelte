<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import SearchTipsDialog from "../SearchTipsDialog.svelte";
  import Modal from "../../Modal.svelte";

  export const meta = {
    title: "Common / Dialog / Search Tips Dialog",
    component: SearchTipsDialog,
  };
</script>

<Story name="default">
  <Modal component={SearchTipsDialog} />
</Story>
