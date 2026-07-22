<script module lang="ts">
  import type { Document } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Data from "../Data.svelte";

  import doc from "@/test/fixtures/documents/document.json";

  const document = {
    ...doc,
    data: {},
  } as Document;

  const tags = {
    _tag: ["British politics", "2010", "PBS NewsHour"],
  };

  const kv = {
    people: ["David Cameron", "Nick Clegg"],
    parties: ["Tories", "Liberal Democrats"],
    country: ["UK"],
  };

  const data = {
    ...tags,
    ...kv,
  };

  const { Story } = defineMeta({
    title: "Documents / Menus / Data",
    component: Data,
    parameters: {
      layout: "centered",
    },
    tags: ["autodocs"],
  });
</script>

<Story name="Data + Tags" asChild>
  <Data document={{ ...document, data }} />
</Story>

<Story name="Empty" asChild>
  <Data {document} />
</Story>

<Story name="Tags" asChild>
  <Data document={{ ...document, data: tags }} />
</Story>

<Story name="KV Data" asChild>
  <Data document={{ ...document, data: kv }} />
</Story>

<Story name="Editable" asChild>
  <Data document={{ ...document, data, edit_access: true }} />
</Story>
