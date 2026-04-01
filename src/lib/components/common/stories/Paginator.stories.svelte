<script context="module" lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";

  import Paginator from "../Paginator.svelte";

  const args = {
    has_next: true,
    has_previous: true,
  };

  const { Story } = defineMeta({
    component: Paginator,
    title: "Common / Paginator",
    tags: ["autodocs"],
    parameters: {
      layout: "centered",
    },
    render: template,
  });
</script>

{#snippet template(args)}
  <div class="container">
    <Paginator
      {...args}
      on:goTo={action("Go To")}
      on:next={action("Next")}
      on:previous={action("Previous")}
    />
  </div>
{/snippet}

<Story name="Default" {args} />
<Story name="Only Page" args={{ has_next: false, has_previous: false }} />
<Story name="First Page" args={{ has_next: true, has_previous: false }} />
<Story name="Last Page" args={{ has_next: false, has_previous: true }} />
<Story name="With Page" args={{ ...args, page: 1 }} />
<Story name="With Page and Count" args={{ ...args, page: 2, totalPages: 12 }} />
<Story
  name="With Go To Page"
  args={{ ...args, page: 1, totalPages: 12, goToNav: true }}
/>

<style>
  .container {
    border: 1px solid gray;
    padding: 1em;
  }
</style>
