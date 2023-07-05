<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import Popularity from "../Popularity.svelte";

  const args = {
    useCount: 100,
  };
</script>

<Meta
  title="Add-Ons / Browser / List / Item / Popularity"
  tags={["autodocs"]}
  component={Popularity}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <Popularity {...args} />
</Template>

<Story name="Tens" args={{ useCount: 84 }} />
<Story name="Hundreds" args={{ useCount: 175 }} />
<Story name="Thousands" args={{ useCount: 33456 }} />
<Story name="Millions" args={{ useCount: 1203495 }} />
