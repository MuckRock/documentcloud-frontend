<script context="module" lang="ts">
  import { _ } from "svelte-i18n";
  import type { Document } from "@/lib/api/types";
  import { Story } from "@storybook/addon-svelte-csf";
  import EditForm from "../Edit.svelte";
  import EditMany from "../EditMany.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;

  export const meta = {
    title: "Forms / Document Edit",
    component: EditForm,
    parameters: { layout: "centered" },
  };
</script>

<Story name="Edit one">
  <div style="min-width: 600px;">
    <EditForm {document}>
      <header>
        <h2>{$_("edit.title")}</h2>
      </header>
    </EditForm>
  </div>
</Story>

<Story name="Bulk edit">
  <div style="min-width: 600px;">
    <EditMany documents={[document]}>
      <header>
        <h2>{$_("edit.title")}</h2>
        <p>
          This will edit all documents to have the same data. Use carefully.
        </p>
      </header>
    </EditMany>
  </div>
</Story>

<Story name="Bulk edit, no documents">
  <div style="min-width: 600px;">
    <EditMany documents={[]}>
      <header>
        <h2>{$_("edit.title")}</h2>
        <p>
          This will edit all documents to have the same data. Use carefully.
        </p>
      </header>
    </EditMany>
  </div>
</Story>

<Story name="Bulk edit, too many documents">
  <div style="min-width: 600px;">
    <EditMany documents={Array(100).fill(document)}>
      <header>
        <h2>{$_("edit.title")}</h2>
        <p>
          This will edit all documents to have the same data. Use carefully.
        </p>
      </header>
    </EditMany>
  </div>
</Story>
