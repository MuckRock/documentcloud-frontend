<script module lang="ts">
  import type { APIError } from "$lib/api/types";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import UploadListItem, { type UploadStatus } from "../UploadListItem.svelte";

  import { document } from "@/test/fixtures/documents";

  const file = new File([new ArrayBuffer(128000)], "test.pdf", {
    type: "application/pdf",
  });

  const weirdFilename = new File(
    [new ArrayBuffer(128000)],
    "test.with.dots.pdf",
    {
      type: "application/pdf",
    },
  );

  const error: APIError<unknown> = {
    status: 500,
    message: "Error uploading",
  };

  const id = "pretend-random-id";

  const { Story } = defineMeta({
    title: "Forms / Upload List Item",
    component: UploadListItem,
    parameters: { layout: "centered" },
  });
</script>

<Story name="ready" args={{ id, status: { step: "ready", file } }} />

<Story
  name="handling file names"
  args={{ id, status: { step: "ready", file: weirdFilename } }}
/>

<Story
  name="created"
  args={{ id, status: { step: "created", document, file } }}
/>

<Story
  name="uploading"
  args={{ id, status: { step: "uploading", document, file } }}
/>

<Story
  name="processing"
  args={{ id, status: { step: "processing", document, file } }}
/>

<Story
  name="error status"
  args={{ id, status: { step: "uploading", error, file } }}
/>
