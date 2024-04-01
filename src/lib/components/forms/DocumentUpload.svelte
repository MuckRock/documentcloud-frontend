<script lang="ts">
  import { _ } from "svelte-i18n";
  import { File16, File24, Upload16 } from "svelte-octicons";
  import Dropzone from "../common/Dropzone.svelte";
  import Flex from "../common/Flex.svelte";
  import Field from "../common/Field.svelte";
  import FieldLabel from "../common/FieldLabel.svelte";
  import InputSelect from "../common/InputSelect.svelte";
  import Switch from "../common/Switch.svelte";
  import Premium from "../common/Premium.svelte";
  import Button from "../common/Button.svelte";
  import Empty from "../common/Empty.svelte";
  import InputText from "../common/InputText.svelte";
  import InputFile from "../common/InputFile.svelte";

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

  let files = [];
  let fileDropActive;
  function onFileSelect(files: FileList) {
    console.log(files);
  }
</script>

<form>
  <Flex gap={1} align="stretch">
    <div class="files">
      <div class="fileList" class:empty={files.length === 0}>
        {#if files.length > 0}
          {#each files as file}
            <InputText bind:value={file.name} />
          {/each}
        {:else}
          <Empty icon={File24}>
            Get started by selecting, pasting, or dragging-and-dropping files
            below
          </Empty>
        {/if}
      </div>
      <div class="fileUpload">
        <Dropzone bind:active={fileDropActive} onDrop={onFileSelect}>
          <div class="fileDrop" class:active={fileDropActive}>
            <p class="drop-instructions">Drag and drop files here</p>
            <Flex align="center" justify="center">
              <span class="drop-instructions-or">or</span>
              <InputFile {onFileSelect}><File16 /> Select Files</InputFile>
            </Flex>
          </div>
        </Dropzone>
      </div>
    </div>
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
  </Flex>
</form>

<style>
  .files {
    max-width: 32rem;
    flex: 1 0 0;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    flex: 1 0 0;
    align-self: stretch;
  }

  .fileList {
    display: flex;
    padding: 1.5rem;
    flex-direction: column;
    gap: 0.75rem;
    align-self: stretch;
    flex: 1 0 0;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2, #d8dee2);
  }

  .fileList.empty {
    justify-content: center;
    align-items: center;
  }

  .fileUpload {
    flex: 0 0 0;
    width: 100%;
  }

  .fileDrop {
    display: flex;
    padding: 1rem 1.5rem;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    align-self: stretch;

    border-radius: 0.5rem;
    border: 1px solid var(--gray-2, #d8dee2);
    background: var(--gray-1, #f5f6f7);
  }

  .drop-instructions {
    color: var(--gray-5, #233944);
    text-align: center;
    font-family: "Source Sans Pro";
    font-size: 1rem;
    font-style: normal;
    font-weight: 600;
    line-height: 1.25rem; /* 125% */

    opacity: 0.75;
  }

  .drop-instructions-or {
    color: var(--gray-4);
  }

  .fileDrop.active {
    background: var(--blue-2);
    border-color: var(--blue-3);
  }

  .fileDrop.active .drop-instructions {
    color: var(--blue-5);
  }

  .sidebar {
    height: 100%;
    max-width: 18rem;
    flex: 0 1 8rem;
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
