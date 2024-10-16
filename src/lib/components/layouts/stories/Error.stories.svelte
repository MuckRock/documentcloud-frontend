<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Error from "../Error.svelte";
  import Button from "../../common/Button.svelte";

  export const meta = {
    title: "Layout / Error",
    component: Error,
    parameters: { layout: "fullscreen" },
  };
</script>

<Story name="With Message">
  <div class="vh-100">
    <Error>
      <p slot="status">500 Error</p>
      <p slot="message">Something broke on our end!</p>
    </Error>
  </div>
</Story>

<Story name="With Action">
  <div class="vh-100">
    <Error>
      <p slot="status">404 Error</p>
      <p slot="message">Page not found</p>
      <Button mode="primary">Go home</Button>
    </Error>
  </div>
</Story>

<style>
  .vh-100 {
    height: 100vh;
  }
</style>
