<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import UploadOptions from "../UploadOptions.svelte";

  let args = {};

  import { mockGetMe, mockGetOrg } from "../../test/handlers/accounts";

  export const meta = {
    title: "Common / Upload Options",
    component: UploadOptions,
    parameters: {
      layout: "centered",
      chromatic: { delay: 300 },
    },
  };
</script>

<Template let:args>
  <UploadOptions {...args} />
</Template>

<Story
  name="As Free Org Member"
  {args}
  parameters={{ msw: { handlers: [mockGetMe.freeOrgMember, mockGetOrg.free] } }}
/>
<Story
  name="As Free Org Admin"
  {args}
  parameters={{ msw: { handlers: [mockGetMe.freeOrgAdmin, mockGetOrg.free] } }}
/>
<Story
  name="As Premium Org Member"
  {args}
  parameters={{ msw: { handlers: [mockGetMe.data, mockGetOrg.data] } }}
/>
<Story
  name="As Free User"
  {args}
  parameters={{ msw: { handlers: [mockGetMe.freeUser, mockGetOrg.free] } }}
/>
<Story
  name="As Pro User"
  {args}
  parameters={{ msw: { handlers: [mockGetMe.proUser] } }}
/>
