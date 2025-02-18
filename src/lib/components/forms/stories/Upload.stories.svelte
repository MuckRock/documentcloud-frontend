<script context="module" lang="ts">
  import { writable } from "svelte/store";
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Upload from "../Upload.svelte";
  import Unverified from "../../accounts/Unverified.svelte";

  import { me } from "@/test/fixtures/accounts";

  export const meta = {
    title: "Forms / Document Upload",
    component: Upload,
    parameters: { layout: "centered" },
  };

  const args = {
    files: [],
  };

  const user = { ...me, verified_journalist: false };
</script>

<Template let:args>
  <Upload {...args} />
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

<Story
  name="With Long File Name"
  args={{
    ...args,
    files: [
      new File(
        [new ArrayBuffer(128000)],
        "f2a6eaad9a6ebf4753bacd1e9731f29d67c2b84b7098165d2ae9cb83797c52452d66f8d6c342fd29a4229c31b7cd55ad91324be9f897fe5a4b858055d2f0ec65.pdf",
        {
          type: "application/pdf",
        },
      ),
    ],
  }}
/>
