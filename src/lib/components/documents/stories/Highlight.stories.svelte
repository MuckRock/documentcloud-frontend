<script lang="ts" context="module">
  import type { Meta } from "@storybook/svelte";
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Highlight from "../Highlight.svelte";

  import searchResultsFixture from "@/test/fixtures/documents/search-highlight.json";

  const document = searchResultsFixture.results[0];
  const noteHighlights = document?.note_highlights["197010"]!;

  export const meta: Meta = {
    title: "Common / Highlight",
    component: Highlight,
  };

  const segments = [
    "Lorem ipsum dolor sit amet, <em>consetetur sadipscing elitr</em>, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
  ];
</script>

<Template let:args>
  <Highlight {...args} />
</Template>

<Story name="With Page">
  <Highlight title="pg. 2" {segments} />
</Story>

<Story name="With Note">
  <Highlight
    title={noteHighlights.title[0]}
    segments={noteHighlights.description}
  />
</Story>
