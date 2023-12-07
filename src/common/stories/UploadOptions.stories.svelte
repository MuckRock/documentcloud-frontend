<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import UploadOptions from "../UploadOptions.svelte";

  let args = {};

  import {
    mockGetMe,
    mockGetOrg,
  } from "../../pages/app/accounts/stories/mockData";

  export const meta = {
    title: "Common / Upload Options",
    component: UploadOptions,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <UploadOptions {...args} />
</Template>

<Story
  name="Default"
  {args}
  parameters={{ msw: { handlers: [mockGetMe.data, mockGetOrg.data] } }}
/>
