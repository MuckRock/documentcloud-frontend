<script module lang="ts">
  import type { Document, DocumentText } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Text from "../Text.svelte";

  import { document } from "@/test/fixtures/documents";
  import text from "@/test/fixtures/documents/document.txt.json";
  import longDoc from "@/test/fixtures/documents/examples/lefler-thesis.json";
  import ScrollContainer from "./ScrollContainer.svelte";
  import ViewerContext from "../ViewerContext.svelte";

  const { Story } = defineMeta({
    title: "Viewer / Text",
    component: Text,
    parameters: { layout: "fullscreen" },
  });

  const { notes: _notes, ...long } = longDoc as Document;

  const longText: DocumentText = {
    ...text,
    pages: Array.from({ length: long.page_count }, (_, page) => ({
      ...text.pages[page % text.pages.length]!,
      page,
    })),
  };
</script>

<Story name="default" asChild>
  <ViewerContext {document} notes={[]} text={Promise.resolve(text)} mode="text">
    <ScrollContainer>
      <Text />
    </ScrollContainer>
  </ViewerContext>
</Story>

<Story name="long document" asChild>
  <ViewerContext
    document={long}
    notes={[]}
    text={Promise.resolve(longText)}
    mode="text"
  >
    <ScrollContainer>
      <Text />
    </ScrollContainer>
  </ViewerContext>
</Story>

<Story name="starting on page 50" asChild>
  <ViewerContext
    document={long}
    notes={[]}
    text={Promise.resolve(longText)}
    mode="text"
    page={50}
  >
    <ScrollContainer>
      <Text />
    </ScrollContainer>
  </ViewerContext>
</Story>
