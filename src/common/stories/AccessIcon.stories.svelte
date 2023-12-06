<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";

  import AccessIcon from "../AccessIcon.svelte";

  const args = {
    access: "private",
    editable: true,
    showText: true,
  };

  const handleClick = action("click");
</script>

<Meta
  title="Common / Access Icon"
  component={AccessIcon}
  parameters={{
    layout: "centered",
  }}
  argTypes={{
    access: {
      control: "select",
      options: ["public", "private", "organization"],
    },
  }}
/>

<Template let:args>
  <AccessIcon {...args} on:click={handleClick} />
</Template>

<Story name="Private" {args} />
<Story name="Organization" args={{ ...args, access: "organization" }} />
<Story name="Public" args={{ ...args, access: "public" }} />
<Story
  name="Not Editable"
  args={{ ...args, access: "public", editable: false }}
/>
<Story name="Hide Text" args={{ ...args, access: "public", showText: false }} />
