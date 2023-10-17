<script>
  import { action } from "@storybook/addon-actions";
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import OrgMenu from "../OrgMenu.svelte";

  const args = {
    activeOrg: { name: "MuckRock", avatar_url: "", individual: false },
    userOrgs: [],
    changeOrg: action("Change Org"),
  };
</script>

<Meta
  title="Account Navigation / Menus / Org"
  component={OrgMenu}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <OrgMenu {...args} />
</Template>

<Story name="Org" {args} />
