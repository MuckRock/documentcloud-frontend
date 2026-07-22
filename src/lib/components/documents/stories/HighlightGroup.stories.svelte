<script module lang="ts">
  import { _ } from "svelte-i18n";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Highlight from "../Highlight.svelte";
  import HighlightGroup from "../HighlightGroup.svelte";

  const highlights: [string, string[]][] = [
    ["first", ["Hello world"]],
    ["second", ["Goodnight moon"]],
    ["third", ["Foo <em>bar</em> baz"]],
  ];

  const getHref = (id: string) => id;

  const { Story } = defineMeta({
    title: "Common / Highlight Group",
    component: HighlightGroup,
  });
</script>

<Story name="With Highlights" asChild>
  <HighlightGroup {highlights} {getHref}>
    {#snippet children({ id, highlight })}
      <Highlight title={id} segments={highlight} />
    {/snippet}
  </HighlightGroup>
</Story>

<Story name="With All Controls" asChild>
  <HighlightGroup {highlights} {getHref} showAll>
    {#snippet children({ id, highlight })}
      <Highlight title={id} segments={highlight} />
    {/snippet}
  </HighlightGroup>
</Story>
