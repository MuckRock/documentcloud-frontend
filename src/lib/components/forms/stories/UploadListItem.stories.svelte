<script context="module" lang="ts">
  import type { APIError } from "$lib/api/types";
  import { Story } from "@storybook/addon-svelte-csf";
  import UploadListItem from "../UploadListItem.svelte";

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
</script>

<Story name="no status">
  <UploadListItem {file} />
</Story>

<Story name="created">
  <UploadListItem {file} status={{ step: "created", document }} />
</Story>

<Story name="uploading">
  <UploadListItem {file} status={{ step: "uploading", document }} />
</Story>

<Story name="processing">
  <UploadListItem {file} status={{ step: "processing", document }} />
</Story>

<Story name="error status">
  <UploadListItem {file} status={{ step: "uploading", error }} />
</Story>
