<script lang="ts" context="module">
  export interface FormData {
    name: string;
    description: string;
    private: boolean;
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import Button from "../../common/Button.svelte";
  import Loader from "../../common/Loader.svelte";
  import {
    PROJECT_TITLE_CHAR_LIMIT,
    PROJECT_DESCRIPTION_CHAR_LIMIT,
  } from "../../config/config.js";
  import { textAreaResize } from "../../util/textareaResize.js";
  import equal from "fast-deep-equal";

  export let loading: boolean;
  export let editing: boolean;
  export let initialData: FormData;
  export let onSave: (data: FormData, isValid: boolean) => void;
  export let onDelete;
  export let onCancel;
  export let showCollaborators;
  export let embedProject;

  // Copy the data out of initialData for change comparisons
  let {
    name,
    description,
    private: isPrivate,
  } = Object.assign({}, initialData);

  $: normalizedName = name.trim();
  $: changed =
    !editing || !equal({ name, description, private: isPrivate }, initialData);
  $: valid = changed && normalizedName.length > 0;

  let input;
  onMount(() => input.focus());
</script>

<div>
  <Loader active={loading}>
    <div class="mcontent vstack">
      <h1 class="dialogTitle">
        {#if editing}
          {$_("dialogProjectDialog.editProject")}
        {:else}
          {$_("dialogProjectDialog.createProject")}
        {/if}
      </h1>
      <div class="inputpadded flex">
        <label class="name">
          <input
            maxlength={PROJECT_TITLE_CHAR_LIMIT}
            placeholder={$_("dialogProjectDialog.title")}
            bind:value={name}
            bind:this={input}
          /></label
        >
        <label class="checkbox">
          <input type="checkbox" bind:checked={isPrivate} />
          Private
        </label>
        <label class="description">
          <textarea
            maxlength={PROJECT_DESCRIPTION_CHAR_LIMIT}
            placeholder={$_("dialogProjectDialog.projectDesc")}
            bind:value={description}
            use:textAreaResize
          />
        </label>
      </div>
      {#if editing}
        <div class="flex">
          <Button nondescript={true} on:click={showCollaborators}>
            {$_("dialogProjectDialog.manageCollabs")}
          </Button>
          <Button nondescript={true} on:click={embedProject}>
            {$_("dialogProjectDialog.share")}
          </Button>
        </div>
      {/if}
      <div class="flex buttonpadded">
        <Button
          disabledReason={valid
            ? null
            : changed
              ? $_("dialogProjectDialog.enterTitle")
              : $_("dialogProjectDialog.changeTitle")}
          on:click={() =>
            onSave({ name, description, private: isPrivate }, valid)}
        >
          {#if editing}
            {$_("dialog.update")}
          {:else}
            {$_("dialog.create")}
          {/if}
        </Button>
        {#if editing}
          <Button danger={true} on:click={() => onDelete()}>
            {$_("dialog.delete")}
          </Button>
        {/if}
        <Button secondary={true} on:click={() => onCancel()}>
          {$_("dialog.cancel")}
        </Button>
      </div>
    </div>
  </Loader>
</div>

<style lang="scss">
  .dialogTitle {
    margin: 0;
  }

  .name {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
  }

  .description {
    flex: 1 1 auto;
    width: 100%;
  }

  .checkbox {
    flex: 0 1 auto;
    display: inline-flex;
    gap: 0.25rem;
    align-items: center;
  }

  .flex {
    display: flex;
    flex-flow: row wrap;
    gap: 0.75rem;
  }

  .vstack {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
