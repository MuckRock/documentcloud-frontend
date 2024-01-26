<script context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Loader from "../Loader.svelte";

  const args = {
    active: true,
  };

  export const meta = {
    title: "Common / Loader",
    component: Loader,
    tags: ["autodocs"],
    parameters: {
      layout: "centered",
    },
  };

  /*
  export const Active: Story = { args };
  export const Centered: Story = { args: { ...args, center: true } };
  export const Big: Story = { args: { ...args, big: true } };
  export const Inline: Story = { args: { ...args, inline: true } };
  export const Transparent: Story = { args: { ...args, transparent: true } };
  export const Padded: Story = { args: { ...args, pad: true } };
  */
</script>

<Template let:args>
  <div class="container">
    <Loader {...args}>
      <p>Loaded content</p>
    </Loader>
  </div>
</Template>

<Story name="default" {args} />

<Story name="centered" args={{ ...args, centered: true }} />

<Story name="big" args={{ ...args, big: true }}></Story>

<Story name="inline" args={{ ...args, inline: true }}></Story>

<Story name="transparent" args={{ ...args, transparent: true }}></Story>

<Story name="padded" args={{ ...args, padded: true }}></Story>

<style>
  .container {
    border: 1px solid gray;
    height: 120px;
    width: 80px;
  }

  .container p {
    margin: 50% auto;
    position: relative;
    text-align: center;
  }
</style>
