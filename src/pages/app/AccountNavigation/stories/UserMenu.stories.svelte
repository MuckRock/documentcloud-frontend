<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import UserMenu from "../UserMenu.svelte";
</script>

<Meta
  title="Account Navigation / Menus / User"
  component={UserMenu}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <UserMenu {...args} />
</Template>

<Story name="Signed Out" args={{}} />
<Story
  name="Signed In"
  args={{
    user: {
      id: 110237,
      avatar_url:
        "https://cdn.muckrock.com/media/account_images/allan-headshot-2016.jpg",
      name: "Allan Lasser",
      organization: {
        id: 40742,
        avatar_url:
          "https://cdn.muckrock.com/media/account_images/allan-headshot-2016.jpg",
        individual: true,
        monthly_ai_credits: 2000,
        name: "lasser.allan",
        number_ai_credits: 0,
        slug: "lasserallan",
        uuid: "9ae6ba3f-d5d4-456c-a7b7-0e83512dfd98",
      },
      organizations: [40742, 125],
      admin_organizations: [40742],
      username: "lasser.allan",
      uuid: "9ae6ba3f-d5d4-456c-a7b7-0e83512dfd98",
      verified_journalist: true,
    },
  }}
/>
