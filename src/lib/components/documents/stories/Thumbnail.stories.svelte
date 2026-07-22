<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ThumbnailComponent from "../Thumbnail.svelte";
  import type { Document } from "$lib/api/types";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import santaanasFixture from "@/test/fixtures/documents/examples/the-santa-anas.json";
  const document = doc as Document;
  const santaanas = santaanasFixture as Document;

  const { Story } = defineMeta({
    title: "Documents / Thumbnail",
    component: ThumbnailComponent,
    parameters: {
      layout: "centered",
    },
  });
</script>

<Story name="Basic" args={{ document }} />

<Story name="With Notes" args={{ document: santaanas }} />

<Story name="Pending" args={{ document: { ...document, status: "pending" } }} />

<Story name="Error" args={{ document: { ...document, status: "error" } }} />

<Story name="No File" args={{ document: { ...document, status: "nofile" } }} />
