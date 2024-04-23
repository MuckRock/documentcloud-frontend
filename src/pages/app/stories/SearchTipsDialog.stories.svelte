<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";

  import Modal from "@/common/Modal.svelte";
  import SearchTipsDialog from "../../../common/dialog/SearchTipsDialog.svelte";

  export const meta = {
    title: "App / Search / Search Tips Dialog",
    component: SearchTipsDialog,
    parameters: { layout: "fullscreen" },
  };
</script>

<Story name="default">
  <Modal component={SearchTipsDialog} />
</Story>
