<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import OrgMemberList from "../OrgMemberList.svelte";
  import { mockInMyOrg } from "../../../../test/handlers/accounts";

  const args = { orgId: 1, myId: 4 };

  export const meta = {
    title: "App / Accounts / Menus / Org / Member List",
    component: OrgMemberList,
    parameters: {
      layout: "centered",
    },
  };
</script>

<Template let:args>
  <OrgMemberList {...args} />
</Template>

<Story
  name="Success"
  {args}
  parameters={{ msw: { handlers: [mockInMyOrg.data] } }}
/>
<Story
  name="Loading"
  {args}
  parameters={{ msw: { handlers: [mockInMyOrg.loading] } }}
/>
<Story
  name="Error"
  {args}
  parameters={{ msw: { handlers: [mockInMyOrg.error] } }}
/>
<Story
  name="Empty"
  {args}
  parameters={{ msw: { handlers: [mockInMyOrg.empty] } }}
/>
