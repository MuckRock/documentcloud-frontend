<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Copy16, ShieldLock24 } from "svelte-octicons";

  import type { Project } from "$lib/api/types";
  import { canonicalUrl, embedUrl } from "$lib/api/projects";

  import Button from "$lib/components/common/Button.svelte";
  import Field from "$lib/components/common/Field.svelte";
  import FieldLabel from "$lib/components/common/FieldLabel.svelte";
  import Text from "$lib/components/inputs/Text.svelte";
  import TextArea from "$lib/components/inputs/TextArea.svelte";
  import Tip from "$lib/components/common/Tip.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import EditProject from "$lib/components/forms/EditProject.svelte";
  import copy from "$lib/utils/copy";

  export let project: Project;

  let editing = false;
  const closeEditing = () => (editing = false);
  const openEditing = () => (editing = true);

  $: isPrivate = project.private;

  $: permalink = canonicalUrl(project);
  $: embedSrc = embedUrl(project);
  $: iframe = `<iframe src="${embedUrl(project).href}" />`;
</script>

<div class="share">
  <iframe class="embed" title="Embed Preview" src={embedSrc.href} />
  <div class="fields">
    {#if isPrivate}
      <div class="banner">
        <Tip mode="danger">
          <ShieldLock24 slot="icon" />
          <div class="privateWarning">
            <div style:flex="1 1 auto">
              {$_("share.privateWarning", { values: { type: "project" } })}
            </div>
            {#if project.edit_access}
              <Button mode="danger" size="small" on:click={openEditing}>
                {$_("share.privateFix")}
              </Button>
            {/if}
          </div>
        </Tip>
      </div>
    {/if}
    <Field>
      <FieldLabel>
        {$_("share.permalink")}
        <Button
          slot="action"
          size="small"
          ghost
          mode="primary"
          on:click={() => copy(String(permalink))}
          disabled={!navigator.clipboard}
        >
          <Copy16 />
          {$_("share.copy")}
        </Button>
      </FieldLabel>
      <Text
        value={String(permalink)}
        --font-family="var(--font-mono)"
        --font-size="var(--font-sm)"
      />
    </Field>
    <Field>
      <FieldLabel>
        {$_("share.iframe")}
        <Button
          slot="action"
          size="small"
          ghost
          mode="primary"
          on:click={() => copy(iframe)}
          disabled={!navigator.clipboard}
        >
          <Copy16 />
          {$_("share.copy")}
        </Button>
      </FieldLabel>
      <TextArea
        value={iframe}
        --font-family="var(--font-mono)"
        --font-size="var(--font-sm)"
        --resize="vertical"
      />
    </Field>
  </div>
</div>
{#if editing}
  <Portal>
    <Modal on:close={closeEditing}>
      <h1 slot="title">{$_("projects.edit")}</h1>
      <EditProject {project} on:close={closeEditing} />
    </Modal>
  </Portal>
{/if}

<style>
  .banner {
    flex: 1 1 100%;
    margin-bottom: 1rem;
  }
  .privateWarning {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .share {
    flex: 1 1 auto;
    height: min(50vh, 100%);
    width: min(70vw, 100%);
    display: flex;
    flex-flow: row-reverse wrap-reverse;
    align-items: flex-end;
    justify-content: center;
    gap: 1rem;
  }
  .fields {
    flex: 1 1 auto;
    max-height: min-content;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .embed {
    min-height: 32rem;
    flex: 1 1 26rem;
    border: 1px solid var(--gray-2);
    border-radius: 1rem;
    box-shadow: inset var(--shadow-2);
    background: var(--gray-1);
    overflow: hidden;
  }
</style>
