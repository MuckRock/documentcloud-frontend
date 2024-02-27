<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import MainLayout from "../MainLayout.svelte";

  export const meta = {
    title: "Components / Main Layout",
    component: MainLayout,
    parameters: { layout: "fullscreen" },
  };
</script>

<Story name="Desktop">
  <MainLayout>
    <ul slot="content">
      <li>Content Item #1</li>
      <li>Content Item #2</li>
      <li>Content Item #3</li>
    </ul>
    <ul slot="navigation">
      <li>Nav #1</li>
      <li>Nav #2</li>
      <li>Nav #3</li>
    </ul>
    <ul slot="action">
      <li>Action #1</li>
      <li>Action #2</li>
      <li>Action #3</li>
    </ul>
  </MainLayout>
</Story>
