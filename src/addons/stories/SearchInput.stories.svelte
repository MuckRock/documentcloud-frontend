<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import SearchInput, { query } from "../browser/SearchInput.svelte";

  const args = {};
</script>

<Meta
  title="Add-Ons / Browser / Search"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={SearchInput}
/>

<Template let:args>
  <SearchInput {...args} />

  <p>Query: {$query}</p>
</Template>

<Story name="Search" {args} />
