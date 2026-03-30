<script module lang="ts">
  import type { ComponentProps } from "svelte";
  import type { APIError, Document, ValidationError } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  import EditAccess from "../EditAccess.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;

  const { Story } = defineMeta({
    title: "Forms / Edit Access",
    component: EditAccess,
    parameters: { layout: "centered" },
  });

  const error: APIError<ValidationError> = {
    status: 400,
    message: "Unable to change access level",
    errors: {
      access: ["You do not have permission to make this document public"],
    },
  };
</script>

{#snippet template(args: ComponentProps<typeof EditAccess>)}
  <div style="min-width: 600px;">
    <EditAccess {...args}>
      <header>
        <h2>Change document access</h2>
      </header>
    </EditAccess>
  </div>
{/snippet}

<Story name="Default" args={{ document }} {template} />

<Story name="With error" args={{ document, error }} {template} />

<Story name="Private document" asChild>
  <div style="min-width: 600px;">
    <EditAccess document={{ ...document, access: "private" }}>
      <header>
        <h2>Change document access</h2>
        <p>This document is currently private.</p>
      </header>
    </EditAccess>
  </div>
</Story>

<Story name="Private document with scheduled publication" asChild>
  <div style="min-width: 600px;">
    <EditAccess
      document={{
        ...document,
        access: "private",
        publish_at: "2026-03-30T16:38:02.407Z",
      }}
    >
      <header>
        <h2>Change document access</h2>
        <p>This document will become public.</p>
      </header>
    </EditAccess>
  </div>
</Story>

<Story name="Organization document" asChild>
  <div style="min-width: 600px;">
    <EditAccess document={{ ...document, access: "organization" }}>
      <header>
        <h2>Change document access</h2>
        <p>This document is currently visible to your organization.</p>
      </header>
    </EditAccess>
  </div>
</Story>

<Story name="Public document" asChild>
  <div style="min-width: 600px;">
    <EditAccess document={{ ...document, access: "public" }}>
      <header>
        <h2>Change document access</h2>
        <p>This document is currently public.</p>
      </header>
    </EditAccess>
  </div>
</Story>
