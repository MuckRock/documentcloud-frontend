<script context="module" lang="ts">
  import type { APIError } from "$lib/api/types";
  import { Story } from "@storybook/addon-svelte-csf";
  import UploadListItem, { type UploadStatus } from "../UploadListItem.svelte";

  export const meta = {
    title: "Forms / Upload List Item",
    component: UploadListItem,
    parameters: { layout: "centered" },
  };

  import { document } from "@/test/fixtures/documents";

  const file = new File([new ArrayBuffer(128000)], "test.pdf", {
    type: "application/pdf",
  });

  const error: APIError<unknown> = {
    status: 500,
    message: "Error uploading",
  };

  const id = "pretend-random-id";
</script>

<Story name="ready">
  <UploadListItem {id} status={{ step: "ready", file }} />
</Story>

<Story name="created">
  <UploadListItem {id} status={{ step: "created", document, file }} />
</Story>

<Story name="uploading">
  <UploadListItem {id} status={{ step: "uploading", document, file }} />
</Story>

<Story name="processing">
  <UploadListItem {id} status={{ step: "processing", document, file }} />
</Story>

<Story name="error status">
  <UploadListItem {id} status={{ step: "uploading", error, file }} />
</Story>
