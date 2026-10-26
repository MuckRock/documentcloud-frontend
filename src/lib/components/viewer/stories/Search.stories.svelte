<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Search from "../Search.svelte";

  import { document } from "@/test/fixtures/documents";
  import { searchWithin } from "@/test/handlers/documents";
  import text from "@/test/fixtures/documents/document.txt.json";

  import ScrollContainer from "./ScrollContainer.svelte";
  import ViewerContext from "../ViewerContext.svelte";

  const { Story } = defineMeta({
    title: "Viewer / Search",
    component: Search,
    parameters: { layout: "fullscreen" },
    render: template,
  });

  const query = "Trump";

  const page = {
    url: new URL(
      `https://www.dev.documentcloud.org/documents/20000040-the-santa-anas/?q=${query}`,
    ),
  };

  function parameters(handler) {
    return {
      msw: { handlers: [handler] },
      sveltekit_experimental: { state: { page } },
    };
  }
</script>

{#snippet template()}
  <ViewerContext
    {document}
    notes={[]}
    text={Promise.resolve(text)}
    mode="search"
  >
    <ScrollContainer>
      <Search />
    </ScrollContainer>
  </ViewerContext>
{/snippet}

<Story name="Empty" parameters={parameters(searchWithin.empty)} />

<Story name="With Data" parameters={parameters(searchWithin.data)} />

<Story name="Loading" parameters={parameters(searchWithin.loading)} />

<Story name="With Error" parameters={parameters(searchWithin.error)} />
