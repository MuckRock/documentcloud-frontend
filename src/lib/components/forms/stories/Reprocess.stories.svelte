<script module lang="ts">
  import type { APIError } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
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

  const { Story } = defineMeta({
    title: "Forms / Reprocess",
    component: Reprocess,
    parameters: { layout: "centered" },
  });
</script>

<Story name="Single Document" args={{ documents: [document] }} />

<Story name="Multiple Documents" args={{ documents }} />

<Story name="Errors" args={{ documents, errors }} />

<Story name="Multilingual" args={{ documents: multilingual }} />

<Story name="Pending documents" args={{ documents: pending }} />

<Story name="Too many documents" args={{ documents: documents.concat(document) }} />
