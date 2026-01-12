<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Language from "../Language.svelte";

  export const meta = {
    title: "Forms / Inputs /Language",
    component: Language,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <div>
    <Language placeholder="Language" />
  </div>
</Story>

<Story name="Required">
  <div>
    <Language placeholder="Select a language" required />
  </div>
</Story>

<Story name="With Pre-selected Value">
  <div>
    <Language
      placeholder="Language"
      value={{ value: "spa", label: "Spanish; Castilian" }}
    />
  </div>
</Story>

<Story name="Custom Name Attribute">
  <div>
    <Language name="document_language" placeholder="Document Language" />
  </div>
</Story>

<Story name="Custom Placeholder">
  <div>
    <Language placeholder="Choose document language..." />
  </div>
</Story>

<Story name="Required With French Pre-selected">
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
