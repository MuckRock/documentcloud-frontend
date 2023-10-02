<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import SearchInput from "../SearchInput.svelte";
  import SearchInputDemo from "./SearchInput.demo.svelte";
</script>

<Meta
  title="Add-Ons / Browser / Components / Search"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={SearchInput}
/>

<Story name="Search">
  <SearchInputDemo />
</Story>
