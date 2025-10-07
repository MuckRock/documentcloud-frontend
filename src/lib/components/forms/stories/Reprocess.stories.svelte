<script context="module" lang="ts">
  import type { APIError } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import Reprocess from "../Reprocess.svelte";

  import { document, documentsList } from "@/test/fixtures/documents";

  const documents = documentsList.results;

  const multilingual = documents.map((d, i) => {
    return {
      ...d,
      language: i % 2 ? d.language : "it",
    };
  });

  const pending = documents.map((d, i) => {
    return {
      ...d,
      status: i % 2 ? "pending" : d.status,
    };
  });

  const errors: APIError<string[]> = {
    status: 400,
    message: "FAIL!",
    errors: ["This is what an error looks like", "There can be more than one"],
  };

  export const meta = {
    title: "Forms / Reprocess",
    component: Reprocess,
    parameters: { layout: "centered" },
  };
</script>

<Story name="Single Document">
  <Reprocess documents={[document]} />
</Story>

<Story name="Multiple Documents">
  <Reprocess {documents} />
</Story>

<Story name="Errors">
  <Reprocess {documents} {errors} />
</Story>

<Story name="Multilingual">
  <Reprocess documents={multilingual} />
</Story>

<Story name="Pending documents">
  <Reprocess documents={pending} />
</Story>

<Story name="Too many documents">
  <Reprocess documents={documents.concat(document)} />
</Story>
