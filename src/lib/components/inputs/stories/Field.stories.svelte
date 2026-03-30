<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import Field from "../Field.svelte";

  const { Story } = defineMeta({
    title: "Forms / Inputs / Field",
    component: Field,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });
</script>

<Story name="Default" asChild>
  <Field title="Name">
    <input type="text" placeholder="Enter a name" />
  </Field>
</Story>

<Story name="With description" asChild>
  <Field title="Name" description="Enter the full name of the document.">
    <input type="text" placeholder="Enter a name" />
  </Field>
</Story>

<Story name="Required" asChild>
  <Field title="Name" required>
    <input type="text" placeholder="Required field" />
  </Field>
</Story>

<Story name="Inline" asChild>
  <Field title="Name" inline>
    <input type="text" placeholder="Inline layout" />
  </Field>
</Story>

<Story name="Screen reader only label" asChild>
  <Field title="Hidden label" sronly>
    <input type="text" placeholder="Label is visually hidden" />
  </Field>
</Story>

<Story name="With error" asChild>
  <Field title="Name">
    <input type="text" value="Bad value" />
    {#snippet error()}
      <p style="color: var(--caution, red); font-size: 0.875em;">
        This field has an error.
      </p>
    {/snippet}
  </Field>
</Story>
