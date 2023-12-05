<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Badge from "../Badge.svelte";
  import BadgeDemo from "./Badge.demo.svelte";

  export const meta = {
    title: "Common / Badge",
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    component: Badge,
    argTypes: { selected: { control: "boolean" } },
  };
</script>

<Template let:args>
  <BadgeDemo {...args} />
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
