<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import AddOnListItem from "../AddOnListItem.svelte";
  import { addon as baseAddon } from "@/test/fixtures/addons";

  const addon = {
    ...baseAddon,
    name: "Scraper",
    repository: "MuckRock/documentcloud-scraper-addon",
    parameters: {
      ...baseAddon.parameters,
      description:
        "This add-on will scrape and optionally crawl a given site for documents to upload to DocumentCloud. It can also alert you of given keywords appearing in those documents.",
    },
  };

  const args = { addon };

  const { Story } = defineMeta({
    title: "Add-Ons /List Item",
    component: AddOnListItem,
    parameters: { layout: "centered" },
  });
</script>

<Story name="Default" {args} />
<Story name="Pinned" args={{ addon: { ...addon, active: true } }} />
<Story
  name="Long Description"
  args={{
    addon: {
      ...addon,
      name: "SideKick",
      parameters: {
        ...addon.parameters,
        description:
          "SideKick is machine learning tool designed to help you quickly test ways to categorize large documents sets, apply machine learning to try to sort documents into one set or another, and get feedback on how well the model works. We're working on launching an improved, real-time graphical categorization tool, but in the meantime, this Add-On will let you get started. # Step 1: Select a project on the left-hand sidebar before running this Add-On. If you need to, click *Cancel*, select a project, and start SideKick again. # Step 2: Use DocumentCloud's *Edit->Edit Document Data* feature to add a key value pair with the category you want, with about five examples of documents that match a category and five that don't. For example, you might add a key of *Email* with five documents set to *True* and five set to *False*. Since *Email* is the value you're training on, set it as the *Value to Train* below. SideKick is a binary classifier — it will try to rank all documents on a spectrum from -1 to 1 based on how likely it believe the document is to be that value.",
      },
    },
  }}
/>
<Story
  name="HTML Description"
  args={{
    addon: {
      ...addon,
      name: "SideKick",
      parameters: {
        ...addon.parameters,
        description:
          "<h1>Heading</h2><p><strong>Lorem ipsum dolor sit amet,</strong> <em>consetetur sadipscing elitr,</em> <a>sed diam nonumy eirmod</a> tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>",
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
