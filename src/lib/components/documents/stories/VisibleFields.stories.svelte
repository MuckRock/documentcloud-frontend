<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import VisibleFieldsComponent from "../VisibleFields.svelte";
  import type { Document } from "@/lib/api/types";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import santaanas from "@/test/fixtures/documents/examples/the-santa-anas.json";
  import { setContext } from "svelte";
  import { defaultVisibleFields } from "../VisibleFields.svelte";
  import { writable } from "svelte/store";
  const document = doc as Document;

  export const meta = {
    title: "Components / Documents / Visible Fields",
    component: VisibleFieldsComponent,
    parameters: {
      layout: "centered",
    },
  };
</script>

<script lang="ts">
  setContext("visibleFields", writable(defaultVisibleFields));
</script>

<Template let:args>
  <VisibleFieldsComponent {...args} />
</Template>

<Story name="Basic" args={{ document }} />
