<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import { PlusCircle16 } from "svelte-octicons";
  import Button from "../Button.svelte";

  export const meta = {
    title: "Components / Common / Button",
    component: Button,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Button {...args}></Button>
</Template>

<Story name="default" />

<Story name="link" args={{ href: "https://www.documentcloud.org" }} />

<Story name="primary" args={{ mode: "primary" }} />

<Story name="ghost" args={{ ghost: true, mode: "primary" }} />

<Story name="danger" args={{ mode: "danger" }} />

<Story name="premium" args={{ model: "premium" }} />

<Story name="small" args={{ size: "small" }} />

<Story name="slotted">
  <Button>
    <PlusCircle16 /> Upload
  </Button>
</Story>

<Story name="slotted ghost">
  <Button ghost mode="primary">
    <PlusCircle16 /> Upload
  </Button>
</Story>

<Story name="disabled ghost">
  <Button ghost mode="primary" disabled>
    <PlusCircle16 /> Upload
  </Button>
</Story>

<Story name="disabled" args={{ disabled: true }} />

<Story
  name="link disabled"
  args={{ href: "https://www.documentcloud.org", disabled: true }}
/>
