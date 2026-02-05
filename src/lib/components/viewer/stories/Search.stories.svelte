<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Search from "../Search.svelte";
  import { document } from "@/test/fixtures/documents";
  import { searchWithin } from "@/test/handlers/documents";
  import text from "@/test/fixtures/documents/document.txt.json";
  import ViewerContext from "../ViewerContext.svelte";

  const { Story } = defineMeta({
    title: "Viewer / Search",
    component: Search,
    parameters: { layout: "centered" },
  });

  const query = "Trump";
</script>

<Story
  name="Empty"
  parameters={{
    msw: { handlers: [searchWithin.empty] },
    sveltekit_experimental: {
      stores: {
        page: {
          url: new URL(
            `https://www.dev.documentcloud.org/documents/20000040-the-santa-anas/?q=${query}`,
          ),
        },
      },
    },
  }}
>
  <ViewerContext {document} text={Promise.resolve(text)} mode="search">
    <Search />
  </ViewerContext>
</Story>

<Story
  name="With Data"
  parameters={{
    msw: { handlers: [searchWithin.data] },
    sveltekit_experimental: {
      stores: {
        page: {
          url: new URL(
            `https://www.dev.documentcloud.org/documents/20000040-the-santa-anas/?q=${query}`,
          ),
        },
      },
    },
  }}
>
  <ViewerContext {document} text={Promise.resolve(text)} mode="search">
    <Search />
  </ViewerContext>
</Story>

<Story
  name="Loading"
  parameters={{
    msw: { handlers: [searchWithin.loading] },
    sveltekit_experimental: {
      stores: {
        page: {
          url: new URL(
            `https://www.dev.documentcloud.org/documents/20000040-the-santa-anas/?q=${query}`,
          ),
        },
      },
    },
  }}
>
  <ViewerContext {document} text={Promise.resolve(text)} mode="search">
    <Search />
  </ViewerContext>
</Story>

<Story
  name="With Error"
  parameters={{
    msw: { handlers: [searchWithin.error] },
    sveltekit_experimental: {
      stores: {
        page: {
          url: new URL(
            `https://www.dev.documentcloud.org/documents/20000040-the-santa-anas/?q=${query}`,
          ),
        },
      },
    },
  }}
>
  <ViewerContext {document} text={Promise.resolve(text)} mode="search">
    <Search />
  </ViewerContext>
</Story>
