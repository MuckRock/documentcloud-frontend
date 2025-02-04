<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Error from "../Error.svelte";

  export const meta = {
    title: "Layout / Error",
    component: Error,
    parameters: { layout: "fullscreen" },
  };
</script>

<script lang="ts">
  import { setContext } from "svelte";
  setContext("me", null);
</script>

<Story name="With Message">
  <div class="vh-100">
    <Error>
      <p slot="status">500 Error</p>
      <p slot="message">Something broke on our end!</p>
    </Error>
  </div>
</Story>

<Story
  name="With Action"
  parameters={{
    sveltekit_experimental: {
      stores: {
        page: {
          url: new URL("http://localhost:3000/missing-page"),
          status: 404,
        },
      },
    },
  }}
>
  <div class="vh-100">
    <Error>
      <p slot="status">404 Error</p>
      <p slot="message">Page not found</p>
    </Error>
  </div>
</Story>

<style>
  .vh-100 {
    height: 100vh;
  }
</style>
