<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import Search from "../Search.svelte";

  export const meta = {
    title: "Forms / Search",
    component: Search,
    parameters: { layout: "centered" },
  };

  const change = action("Change");
  const submit = action("Submit");

  const query = '"steve jobs" macintosh';
</script>

<Story name="With Query">
  <div style="width: 24rem">
    <Search {query} onsubmit={submit} onchange={change} />
  </div>
</Story>

<Story name="Without Query">
  <div style="width: 24rem">
    <Search query="" onsubmit={submit} onchange={change} />
  </div>
</Story>

<Story name="With help">
  <div style="width: 60ch">
    <Search {query} onsubmit={submit} onchange={change}>
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
