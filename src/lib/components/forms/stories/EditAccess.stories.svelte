<script context="module" lang="ts">
  import type { APIError, Document, ValidationError } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Story } from "@storybook/addon-svelte-csf";

  import EditAccess from "../EditAccess.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;

  export const meta = {
    title: "Forms / Edit Access",
    component: EditAccess,
    parameters: { layout: "centered" },
  };

  const error: APIError<ValidationError> = {
    status: 400,
    message: "Unable to change access level",
    errors: {
      access: ["You do not have permission to make this document public"],
    },
  };
</script>

<Story name="Default">
  <div style="min-width: 600px;">
    <EditAccess {document}>
      <header>
        <h2>{$_("edit.fields.access.title")}</h2>
      </header>
    </EditAccess>
  </div>
</Story>

<Story name="With error">
  <div style="min-width: 600px;">
    <EditAccess {document} {error}>
      <header>
        <h2>{$_("edit.fields.access.title")}</h2>
      </header>
    </EditAccess>
  </div>
</Story>

<Story name="Private document">
  <div style="min-width: 600px;">
    <EditAccess document={{ ...document, access: "private" }}>
      <header>
        <h2>Change document access</h2>
        <p>This document is currently private.</p>
      </header>
    </EditAccess>
  </div>
</Story>

<Story name="Organization document">
  <div style="min-width: 600px;">
    <EditAccess document={{ ...document, access: "organization" }}>
      <header>
        <h2>Change document access</h2>
        <p>This document is currently visible to your organization.</p>
      </header>
    </EditAccess>
  </div>
</Story>

<Story name="Public document">
  <div style="min-width: 600px;">
    <EditAccess document={{ ...document, access: "public" }}>
      <header>
        <h2>Change document access</h2>
        <p>This document is currently public.</p>
      </header>
    </EditAccess>
  </div>
</Story>
