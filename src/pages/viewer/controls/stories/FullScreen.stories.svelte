<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import FullScreen from "../FullScreen.svelte";

  export const meta = {
    title: "Viewer / Controls / FullScreen",
    component: FullScreen,
  };
</script>

<Story name="default">
  <FullScreen
    url="https://s3.documentcloud.org/documents/1/a-i-g-bailout-the-inspector-generals-report.pdf"
  />
</Story>
