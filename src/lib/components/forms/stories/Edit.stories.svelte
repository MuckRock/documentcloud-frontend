<script module lang="ts">
  import type { APIError, APIErrors, Document } from "$lib/api/types";

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

  const error: APIError<APIErrors> = {
    status: 400,
    message: "Something went wrong",
    errors: {
      published_url: ["Published URL must be a valid URL"],
    },
  };

  // Errors that aren't about one field come back as a bare array.
  const processingError: APIError<APIErrors> = {
    status: 400,
    message: "Bad Request",
    errors: ["You may not update `access` while the document is processing"],
  };
</script>

<Story name="Edit one" asChild>
  <div style="min-width: 600px;">
    <EditForm {document}>
      <header>
        <h2>Edit Document Metadata</h2>
      </header>
    </EditForm>
  </div>
</Story>

<Story name="Edit one, with error" asChild>
  <div style="min-width: 600px;">
    <EditForm {document} {error}>
      <header>
        <h2>Edit Document Metadata</h2>
      </header>
    </EditForm>
  </div>
</Story>

<Story name="Edit one, with non-field error" asChild>
  <div style="min-width: 600px;">
    <EditForm {document} error={processingError}>
      <header>
        <h2>Edit Document Metadata</h2>
      </header>
    </EditForm>
  </div>
</Story>

<Story name="Edit one (private)" asChild>
  <div style="min-width: 600px;">
    <EditForm document={{ ...document, access: "private" }}>
      <header>
        <h2>Edit document</h2>
      </header>
    </EditForm>
  </div>
</Story>

{#snippet bulkTemplate(documents: Document[], bulkError?: APIError<APIErrors>)}
  <div style="min-width: 600px;">
    <EditMany {documents} error={bulkError}>
      <header>
        <h2>Edit Document Metadata</h2>
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
