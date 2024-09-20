<script lang="ts" context="module">
  import type { ComponentProps } from "svelte";
  import type { Meta } from "@storybook/svelte";
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Component from "../Highlight.svelte";

  import searchResultsFixture from "@/test/fixtures/documents/search-highlight.json";

  const document = searchResultsFixture.results[0];
  const noteHighlights = document.note_highlights["197010"];

  export const meta: Meta = {
    title: "Components / Common / Highlight",
    component: Component,
  };

  let args: ComponentProps<Component> = {
    title: "Search Result",
  };
</script>

<Template let:args>
  <Component {...args} />
</Template>

<Story
  name="With Page"
  args={{
    ...args,
    title: "pg. 2",
    segments: [
      "Lorem ipsum dolor sit amet, <em>consetetur sadipscing elitr</em>, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
    ],
  }}
/>
<Story
  name="With Note"
  args={{
    ...args,
    title: noteHighlights.title,
    segments: noteHighlights.description,
  }}
/>
