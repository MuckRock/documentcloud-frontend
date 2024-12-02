<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Search from "../Search.svelte";

  export const meta = {
    title: "Components / Viewer / Search",
    component: Search,
    parameters: { layout: "centered" },
  };

  import { document, searchWithin } from "@/test/fixtures/documents";
  import text from "@/test/fixtures/documents/document.txt.json";

  import ViewerContext from "../ViewerContext.svelte";
  import type { APIResponse, Highlights } from "@/lib/api/types";

  const query = "Trump";
  const empty: APIResponse<Highlights, null> = { data: {} };
</script>

<Story
  name="Empty"
  parameters={{
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
  <ViewerContext
    {document}
    text={Promise.resolve(text)}
    search={empty}
    mode="search"
  >
    <Search />
  </ViewerContext>
</Story>

<Story
  name="With Results"
  parameters={{
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
  <ViewerContext
    {document}
    text={Promise.resolve(text)}
    search={{ data: searchWithin }}
    mode="search"
  >
    <Search />
  </ViewerContext>
</Story>
