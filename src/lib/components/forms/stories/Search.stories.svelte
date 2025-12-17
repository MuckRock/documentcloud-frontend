<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import Search from "../Search.svelte";

  export const meta = {
    title: "Forms / Search",
    component: Search,
    parameters: { layout: "centered" },
  };

  const args = {
    query: '"steve jobs" macintosh',
  };

  const change = action("Change");
  const submit = action("Submit");
</script>

<Template let:args>
  <div style="width: 24rem">
    <Search {...args} on:submit={submit} on:change={change} />
  </div>
</Template>

<Story name="With Query" {args} />
<Story name="Without Query" args={{ query: "" }} />

<Story name="With help">
  <div style="width: 60ch">
    <Search {...args} on:submit={submit} on:change={change}>
      <span slot="help">
        Search tips: add filters by typing <code>user:</code>,
        <code>project:</code>, or <code>organization:</code>, etc. Use
        <code>sort:</code> to order results.
      </span>
      <a href="https://www.documentcloud.org/help/search/">Learn more</a>
    </Search>
  </div>
</Story>
