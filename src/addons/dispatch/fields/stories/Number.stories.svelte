<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Number from "../Number.svelte";

  let args = {
    name: "crawlDepth",
    title: "Crawl Depth",
    description: "Recursively scrape same-domain links found on the page (Must be between 0 and 2)",
    required: false,
    value: 1,
    min: "0",
    max: "2"
  };
</script>

<Meta
  title="Add-Ons / Dispatch / Form / Fields / Number"
  component={Number}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <Number {...args} />
</Template>

<Story name="Optional" {args} />
<Story name="Required" args={{...args, required: true}} />
<Story name="Inline" args={{...args, inline: true}} />