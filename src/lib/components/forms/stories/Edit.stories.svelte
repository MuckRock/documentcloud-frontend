<script module lang="ts">
  import type { APIError, Document, ValidationError } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  import EditForm from "../Edit.svelte";
  import EditMany from "../EditMany.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;

  const { Story } = defineMeta({
    title: "Forms / Document Edit",
    component: EditForm,
    parameters: { layout: "centered" },
  });

  const error: APIError<ValidationError> = {
    status: 400,
    message: "Something went wrong",
    errors: {
      published_url: ["Published URL must be a valid URL"],
    },
  };
</script>

<Story name="Edit one" asChild>
  <div style="min-width: 600px;">
    <EditForm {document}>
      <header>
        <h2>Edit document</h2>
      </header>
    </EditForm>
  </div>
</Story>

{#snippet bulkTemplate(
  documents: Document[],
  bulkError?: APIError<ValidationError>,
)}
  <div style="min-width: 600px;">
    <EditMany {documents} error={bulkError}>
      <header>
        <h2>Edit document</h2>
        <p>
          This will edit all documents to have the same data. Use carefully.
        </p>
      </header>
    </EditMany>
  </div>
{/snippet}

<Story name="Bulk edit" asChild>
  {@render bulkTemplate([document])}
</Story>

<Story name="Bulk edit, no documents" asChild>
  {@render bulkTemplate([])}
</Story>

<Story name="Bulk edit, too many documents" asChild>
  {@render bulkTemplate(Array(100).fill(document))}
</Story>

<Story name="Bulk edit, with error" asChild>
  {@render bulkTemplate([document], error)}
</Story>
