<script context="module" lang="ts">
  import { writable } from "svelte/store";
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import DocumentUpload from "../DocumentUpload.svelte";
  import Unverified from "../../accounts/Unverified.svelte";

  import { me } from "@/test/fixtures/accounts";

  export const meta = {
    title: "Forms / Document Upload",
    component: DocumentUpload,
    parameters: { layout: "centered" },
  };

  const args = {
    files: [],
  };

  const user = { ...me, verified_journalist: false };
</script>

<Template let:args>
  <DocumentUpload {...args} />
</Template>

<Story name="Empty" {args} />
<Story
  name="With Documents"
  args={{
    ...args,
    files: [
      new File([new ArrayBuffer(128000)], "fileOne.pdf", {
        type: "application/pdf",
      }),
      new File([], "fileTwo.pdf", { type: "application/pdf" }),
      new File([], "fileThree.pdf"),
    ],
  }}
/>
<Story
  name="With Oversized Files"
  args={{
    ...args,
    files: [
      new File([new ArrayBuffer(525336577)], "fileOne.pdf", {
        type: "application/pdf",
      }),
      new File([new ArrayBuffer(128000)], "fileTwo.pdf"),
      new File([new ArrayBuffer(27262977)], "fileThree.png", {
        type: "image/png",
      }),
      new File([new ArrayBuffer(128000)], "fileFour.png"),
    ],
  }}
/>

<Story name="Unverified user" args={{ ...args, user: writable(user) }} />
