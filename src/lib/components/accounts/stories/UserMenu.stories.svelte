<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import UserMenu from "../UserMenu.svelte";

  const { Story } = defineMeta({
    title: "Accounts / User Menu",
    component: UserMenu,
    parameters: { layout: "centered" },
  });
</script>

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
        name: "lasser.allan",
        slug: "lasserallan",
        monthly_credits: 2000,
        purchased_credits: 0,
        uuid: "org-9ae6ba3f-d5d4-456c-a7b7-0e83512dfd98",
      },
      organizations: [40742, 125],
      admin_organizations: [40742],
      username: "lasser.allan",
      uuid: "9ae6ba3f-d5d4-456c-a7b7-0e83512dfd98",
      verified_journalist: true,
    },
  }}
/>

<Story
  name="Missing Avatar"
  args={{
    user: {
      id: 110237,
      avatar_url: undefined,
      name: "Allan Lasser",
      organization: {
        id: 40742,
        avatar_url:
          "https://cdn.muckrock.com/media/account_images/allan-headshot-2016.jpg",
        individual: true,
        monthly_credits: 2000,
        name: "lasser.allan",
        purchased_credits: 0,
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

<Story
  name="Missing Name"
  args={{
    user: {
      id: 110237,
      avatar_url: undefined,
      name: undefined,
      organization: {
        id: 40742,
        avatar_url:
          "https://cdn.muckrock.com/media/account_images/allan-headshot-2016.jpg",
        individual: true,
        monthly_credits: 2000,
        name: "lasser.allan",
        purchased_credits: 0,
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
