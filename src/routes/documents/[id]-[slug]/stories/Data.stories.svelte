<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import Data from "../sidebar/Data.svelte";

  import doc from "$lib/api/fixtures/documents/document.json";

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

  export const meta = {
    title: "Viewer / Sidebar / Data",
    component: Data,
    parameters: {
      layout: "centered",
    },
    tags: ["autodocs"],
  };
</script>

<Story name="Data + Tags">
  <Data document={{ ...document, data }} />
</Story>

<Story name="Empty">
  <Data {document} />
</Story>

<Story name="Tags">
  <Data document={{ ...document, data: tags }} />
</Story>

<Story name="KV Data">
  <Data document={{ ...document, data: kv }} />
</Story>
