<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import AddOnListItem from "../AddOnListItem.svelte";

  const addon = {
    active: false,
    name: "Scraper",
    repository: "MuckRock/documentcloud-scraper-addon",
    usage: 225000,
    parameters: {
      description:
        "This add-on will scrape and optionally crawl a given site for documents to upload to DocumentCloud. It can also alert you of given keywords appearing in those documents.",
    },
  };

  const args = { addon };

  export const meta = {
    title: "Components / Add-Ons / List Item",
    component: AddOnListItem,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <div class="container">
    <AddOnListItem {...args} />
  </div>
</Template>

<Story name="Default" {args} />
<Story name="Pinned" args={{ addon: { ...addon, active: true } }} />
<Story
  name="Long Description"
  args={{
    addon: {
      ...args,
      name: "SideKick",
      parameters: {
        description:
          "SideKick is machine learning tool designed to help you quickly test ways to categorize large documents sets, apply machine learning to try to sort documents into one set or another, and get feedback on how well the model works. We're working on launching an improved, real-time graphical categorization tool, but in the meantime, this Add-On will let you get started. # Step 1: Select a project on the left-hand sidebar before running this Add-On. If you need to, click *Cancel*, select a project, and start SideKick again. # Step 2: Use DocumentCloud's *Edit->Edit Document Data* feature to add a key value pair with the category you want, with about five examples of documents that match a category and five that don't. For example, you might add a key of *Email* with five documents set to *True* and five set to *False*. Since *Email* is the value you're training on, set it as the *Value to Train* below. SideKick is a binary classifier — it will try to rank all documents on a spectrum from -1 to 1 based on how likely it believe the document is to be that value.",
      },
    },
  }}
/>
<Story
  name="Premium"
  args={{
    addon: {
      ...addon,
      parameters: { ...addon.parameters, categories: ["premium"] },
    },
  }}
/>

<style>
  .container {
    max-width: 32rem;
    border: 1px solid #eee;
  }
</style>
