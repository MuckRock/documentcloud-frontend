<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Language from "../Language.svelte";

  const { Story } = defineMeta({
    title: "Forms / Inputs /Language",
    component: Language,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });
</script>

<Story name="default" asChild>
  <div>
    <Language placeholder="Language" />
  </div>
</Story>

<Story name="Required" asChild>
  <div>
    <Language placeholder="Select a language" required />
  </div>
</Story>

<Story name="With Pre-selected Value" asChild>
  <div>
    <Language
      placeholder="Language"
      value={{ value: "spa", label: "Spanish; Castilian" }}
    />
  </div>
</Story>

<Story name="Custom Name Attribute" asChild>
  <div>
    <Language name="document_language" placeholder="Document Language" />
  </div>
</Story>

<Story name="Custom Placeholder" asChild>
  <div>
    <Language placeholder="Choose document language..." />
  </div>
</Story>

<Story name="Required With French Pre-selected" asChild>
  <div>
    <Language
      placeholder="Language"
      required
      value={{ value: "fra", label: "French" }}
    />
  </div>
</Story>

<style>
  div {
    min-width: 40ch;
  }
</style>
