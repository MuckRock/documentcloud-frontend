<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { ShieldLock24 } from "svelte-octicons";

  import Share from "../Share.svelte";
  import Banner from "$lib/components/common/Banner.svelte";
  import Field from "$lib/components/common/Field.svelte";
  import FieldLabel from "$lib/components/common/FieldLabel.svelte";
  import Text from "$lib/components/inputs/Text.svelte";
  import Button from "$lib/components/common/Button.svelte";

  const { Story } = defineMeta({
    title: "Layout / Share",
    component: Share,
    parameters: { layout: "fullscreen" },
  });
</script>

<!-- shared snippets so both stories render the same fields and preview -->
{#snippet fields()}
  <fieldset>
    <Field>
      <FieldLabel>Permalink</FieldLabel>
      <Text value="https://www.documentcloud.org/documents/1-example/" />
    </Field>
    <Field>
      <FieldLabel>Embed URL</FieldLabel>
      <Text
        value="https://embed.documentcloud.org/documents/1-example/?embed=1"
      />
    </Field>
  </fieldset>
{/snippet}

{#snippet preview()}
  <header>
    <FieldLabel>Embed Preview</FieldLabel>
  </header>
  <main>
    <iframe title="Embed Preview" srcdoc="<h1>Embed preview</h1>"></iframe>
  </main>
{/snippet}

<Story name="Default" asChild>
  <Share {fields} {preview} />
</Story>

<Story name="With banner" asChild>
  <Share {fields} {preview}>
    {#snippet banner()}
      <Banner mode="danger" message="This document is private.">
        {#snippet icon()}<ShieldLock24 />{/snippet}
        {#snippet action()}
          <Button>Make public</Button>
        {/snippet}
      </Banner>
    {/snippet}
  </Share>
</Story>
