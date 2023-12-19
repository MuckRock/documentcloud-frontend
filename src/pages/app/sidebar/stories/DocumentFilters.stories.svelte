<script lang="ts" context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import DocumentFilters from "../DocumentFilters.svelte";

  import userFixture from "../../fixtures/me.json";

  export const meta = {
    title: "App / Sidebar / Document Filters",
    component: DocumentFilters,
    parameters: { layout: "centered" },
  };

  const args = {
    user: null,
  };
</script>

<Template let:args>
  <DocumentFilters {...args} />
</Template>

<Story name="Without User" {args} />
<Story
  name="With User"
  args={{ user: { ...userFixture, organization: null } }}
/>
<Story name="With Org User" args={{ user: userFixture }} />
