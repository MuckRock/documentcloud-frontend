<script context="module" lang="ts">
  import type { ComponentProps } from "svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import Search from "../Search.svelte";

  type Args = ComponentProps<typeof Search>;

  const { Story } = defineMeta({
    title: "Forms / Search",
    component: Search,
    parameters: { layout: "centered" },
  });

  const onchange = action("Change");
  const onsubmit = action("Submit");

  const query = '"steve jobs" macintosh';
</script>

{#snippet template(args: Args)}
  <div style="width: 24rem">
    <Search {...args} />
  </div>
{/snippet}

<Story name="With Query" {template} args={{ onsubmit, onchange, query }} />

<Story
  name="Without Query"
  {template}
  args={{ onsubmit, onchange, query: "" }}
/>

<Story name="With help" asChild>
  <div style="width: 60ch">
    <Search {query} {onsubmit} {onchange}>
      {#snippet help()}
        <span>
          Search tips: add filters by typing <code>user:</code>,
          <code>project:</code>, or <code>organization:</code>, etc. Use
          <code>sort:</code> to order results.
        </span>
        <a href="https://www.documentcloud.org/help/search/">Learn more</a>
      {/snippet}
    </Search>
  </div>
</Story>
