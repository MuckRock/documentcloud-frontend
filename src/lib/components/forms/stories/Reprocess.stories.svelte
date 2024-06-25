<script context="module" lang="ts">
  import {_} from 'svelte-i18n';
  import type { Document } from "$lib/api/types";
  import { Story } from "@storybook/addon-svelte-csf";
  import Reprocess from "../Reprocess.svelte";

  import doc from "$lib/api/fixtures/documents/document-expanded.json";
  import docs from "$lib/api/fixtures/documents/documents-expanded.json";

  const document = doc as Document;
  const documents = docs.results as Document[];

  export const meta = {
    title: "Forms / Reprocess",
    component: Reprocess,
    parameters: { layout: "centered" },
  };
</script>

<Story name="Single Document">
  <Reprocess documents={[document]}>
    <header>
      <h2>
        {$_("dialogReprocessDialog.title")}
      </h2>
    </header>
  </Reprocess>
</Story>

<Story name="Multiple Documents">
  <Reprocess {documents}>
    <header>
      <h2>
        {$_("dialogReprocessDialog.title")}
      </h2>
    </header>
  </Reprocess>
</Story>
