<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";

  import AddOnListItem from "@/addons/AddOnListItem.svelte";

  const args = {
    active: false,
    name: "Scraper",
    repository: "MuckRock/documentcloud-scraper-addon",
    usage: 225000,
    parameters: {
      description:
        "This add-on will scrape and optionally crawl a given site for documents to upload to DocumentCloud. It can also alert you of given keywords appearing in those documents.",
    },
  };

  const onClick = action("Click");
</script>

<style>
  .container {
    max-width: 32rem;
    border: 1px solid #eee;
  }
</style>

<Meta
  title="Add-Ons / List Item"
  component={AddOnListItem}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <div class="container">
    <AddOnListItem {...args} on:click={onClick} />
  </div>
</Template>

<Story name="Default" {args} />
<Story name="Pinned" args={{ ...args, active: true }} />
