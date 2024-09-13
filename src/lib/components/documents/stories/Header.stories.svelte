<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import HeaderComponent from "../Header.svelte";
  import type { Document } from "@/lib/api/types";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  const document = doc as Document;

  export const meta = {
    title: "Components / Documents / Header",
    component: HeaderComponent,
    parameters: {
      layout: "centered",
    },
  };

  const html = `This agreement between <i>Conservatives</i> and <em>Liberal Democrats</em> makes <strong>David Cameron</strong> the new prime minister and installs <b>Nick Clegg</b>, whose party came in third in last week's election, as his deputy. The document details the long list of compromises between the two parties, who don't share much in terms of ideology but need each other to form a government. Here, the NewsHour's <u>Simon Marks</u> reads between the lines to explain who won which battles and what each side is giving up.`;
</script>

<Template let:args>
  <HeaderComponent {...args} />
</Template>

<Story name="Without Edit Access" args={{ document }} />

<Story
  name="With Edit Access"
  args={{ document: { ...document, edit_access: true } }}
/>

<Story
  name="With HTML description"
  args={{ document: { ...document, description: html } }}
/>
