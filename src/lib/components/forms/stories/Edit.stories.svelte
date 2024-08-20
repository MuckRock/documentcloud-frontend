<script context="module" lang="ts">
  import { _ } from "svelte-i18n";
  import type { Document } from "@/lib/api/types";
  import { Story } from "@storybook/addon-svelte-csf";
  import EditForm from "../Edit.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;

  export const meta = {
    title: "Forms / Document Edit",
    component: EditForm,
    parameters: { layout: "centered" },
  };
</script>

<Story name="Document Edit">
  <div style="min-width: 600px;">
    <EditForm {document}>
      <header>
        <h2>{$_("edit.title")}</h2>
      </header>
    </EditForm>
  </div>
</Story>
