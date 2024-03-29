<script lang="ts">
  import { _ } from "svelte-i18n";
  import Flex from "../common/Flex.svelte";
  import Field from "../common/Field.svelte";
  import FieldLabel from "../common/FieldLabel.svelte";
  import InputSelect from "../common/InputSelect.svelte";
  import Checkbox from "../common/Checkbox.svelte";
  import Switch from "../common/Switch.svelte";
  import Premium from "../common/Premium.svelte";
  import Button from "../common/Button.svelte";
  import { Upload16 } from "svelte-octicons";

  const projectOptions = [
    { value: "1", label: "FBI Files" },
    { value: "2", label: "1033 Program" },
  ];

  let ocrEngine: string | Record<string, string> = "tess4";
  const ocrEngineOptions = [
    {
      value: "tess4",
      label: "Tesseract",
      help: $_("uploadOptions.tesseract"),
    },
    {
      value: "textract",
      label: "Textract",
      help: $_("uploadOptions.textract"),
    },
  ];
</script>

<form>
  <div class="sidebar">
    <Flex gap={2} direction="column" justify="between">
      <Flex gap={1} direction="column">
        <Field>
          <FieldLabel>Projects</FieldLabel>
          <InputSelect name="projects" multiple items={projectOptions} />
        </Field>
        <hr class="divider" />
        <Field>
          <FieldLabel>OCR Engine</FieldLabel>
          <InputSelect
            name="ocr_engine"
            items={ocrEngineOptions}
            bind:value={ocrEngine}
          />
          <p class="ocrEngineHelp" slot="help">
            {#if typeof ocrEngine !== "string"}
              {@html ocrEngine?.help}
            {/if}
          </p>
        </Field>
        <Field inline>
          <input type="checkbox" />
          <FieldLabel>Force OCR</FieldLabel>
        </Field>
        <hr class="divider" />
        <Premium>
          <Field inline>
            <Switch name="revision_control" />
            <FieldLabel premium>Revision Control</FieldLabel>
          </Field>
          <Field inline slot="basic">
            <Switch name="revision_control" disabled />
            <FieldLabel premium>Revision Control</FieldLabel>
          </Field>
        </Premium>
      </Flex>
      <Button full mode="primary"><Upload16 />Begin Upload</Button>
    </Flex>
  </div>
</form>

<style>
  .sidebar {
    max-width: 18rem;
  }

  .divider {
    width: 100%;
    border: none;
    border-top: 1px solid var(--gray-2, #d8dee2);
  }

  .ocrEngineHelp {
    font-size: var(--font-xs);
  }

  .ocrEngineHelp a {
    color: var(--blue-3);
  }
</style>
