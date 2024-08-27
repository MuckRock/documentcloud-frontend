<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import HeaderComponent from "../Header.svelte";
  import type { Document } from "@/lib/api/types";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  const document = doc as Document;

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

  document.data = data;

  export const meta = {
    title: "Components / Documents / Header",
    component: HeaderComponent,
    parameters: {
      layout: "centered",
    },
  };

  let args = {
    document,
  };
</script>

<Template let:args>
  <HeaderComponent {...args} />
</Template>

<Story name="Without Edit Access" args={{ document }} />

<Story
  name="With Edit Access"
  args={{ document: { ...document, edit_access: true } }}
/>
