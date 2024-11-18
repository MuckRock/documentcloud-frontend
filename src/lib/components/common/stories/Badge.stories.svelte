<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Badge from "../Badge.svelte";
  import Star from "$lib/components/icons/Star.svelte";

  export const meta = {
    title: "Components / Common / Badge",
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    component: Badge,
    argTypes: { selected: { control: "boolean" } },
  };
</script>

<Template let:args>
  <Badge {...args}>
    <Star slot="icon" />
  </Badge>
</Template>

<Story name="Light Color" args={{ label: "Featured", badgeColor: "yellow" }} />
<Story
  name="Dark Color"
  args={{
    label: "Pinned",
    badgeColor: "purple",
    labelColor: "white",
  }}
/>
