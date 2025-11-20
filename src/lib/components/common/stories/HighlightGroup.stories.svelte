<script context="module" lang="ts">
  import { _ } from "svelte-i18n";
  import { Story } from "@storybook/addon-svelte-csf";
  import Highlight from "../Highlight.svelte";
  import HighlightGroup from "../HighlightGroup.svelte";

  const highlights: [string, string[]][] = [
    ["first", ["Hello world"]],
    ["second", ["Goodnight moon"]],
    ["third", ["Foo <em>bar</em> baz"]],
  ];

  const getHref = (id: string) => id;

  export const meta = {
    title: "Common / Highlight Group",
    component: HighlightGroup,
  };
</script>

<Story name="With Highlights">
  <HighlightGroup {highlights} {getHref}>
    <svelte:fragment let:id let:highlight>
      <Highlight title={id} segments={highlight} />
    </svelte:fragment>
  </HighlightGroup>
</Story>

<Story name="With All Controls">
  <HighlightGroup {highlights} {getHref} showAll>
    <svelte:fragment let:id let:highlight>
      <Highlight title={id} segments={highlight} />
    </svelte:fragment>
  </HighlightGroup>
</Story>
