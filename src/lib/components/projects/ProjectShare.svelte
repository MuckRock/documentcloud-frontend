<script lang="ts">
  import type { Project } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { ShieldLock24 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Copy from "../common/Copy.svelte";
  import Field from "$lib/components/common/Field.svelte";
  import FieldLabel from "$lib/components/common/FieldLabel.svelte";
  import Text from "$lib/components/inputs/Text.svelte";
  import TextArea from "$lib/components/inputs/TextArea.svelte";
  import Tip from "$lib/components/common/Tip.svelte";

  import Portal from "$lib/components/layouts/Portal.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import EditProject from "$lib/components/forms/EditProject.svelte";

  import { canonicalUrl, embedUrl } from "$lib/api/projects";
  import * as embed from "$lib/api/embed";

  interface Props {
    project: Project;
  }

  let { project }: Props = $props();

  let editing = $state(false);
  let customizeEmbedOpen = $state(false);

  let isPrivate = $derived(project.private);
  let permalink = $derived(canonicalUrl(project));
  let embedSrc = $derived(embedUrl(project));
  let iframe = $derived(embed.project(project));

  function closeEditing() {
    editing = false;
  }
  function openEditing() {
    editing = true;
  }
</script>

<div class="container">
  {#if isPrivate}
    <div class="banner">
      <Tip mode="danger">
        {#snippet icon()}<ShieldLock24 />{/snippet}
        <div class="privateWarning">
          <div style:flex="1 1 auto">
            {$_("share.privateWarning", {
              values: { type: $_("share.types.project") },
            })}
          </div>
          {#if project.edit_access}
            <Button mode="danger" size="small" onclick={openEditing}>
              {$_("share.privateFix")}
            </Button>
          {/if}
        </div>
      </Tip>
    </div>
  {/if}

  <div class="left">
    <div class="fields">
      <Field>
        <FieldLabel>
          {$_("share.permalink")}
          {#snippet action()}<Copy text={permalink.href} />{/snippet}
        </FieldLabel>
        <Text
          value={permalink.href}
          --font-family="var(--font-mono)"
          --font-size="var(--font-sm)"
        />
      </Field>

      <Field>
        <FieldLabel>
          {$_("share.embed")}
          {#snippet action()}<Copy text={embedSrc.href} />{/snippet}
        </FieldLabel>
        <Text
          value={embedSrc.href}
          --font-family="var(--font-mono)"
          --font-size="var(--font-sm)"
        />
      </Field>

      <Field>
        <FieldLabel>
          {$_("share.iframe")}
          {#snippet action()}<Copy text={iframe} />{/snippet}
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

  <div class="right">
    <header>
      <FieldLabel>
        {$_("share.preview")}
      </FieldLabel>
    </header>

    <main>
      <iframe class="embed" title="Embed Preview" src={embedSrc.href}></iframe>
    </main>
  </div>
</div>
{#if editing}
  <Portal>
    <Modal onclose={closeEditing}>
      {#snippet title()}
        <h1>{$_("projects.edit")}</h1>
      {/snippet}
      <EditProject {project} onclose={closeEditing} />
    </Modal>
  </Portal>
{/if}

<style>
  .container {
    width: 100%;
    height: 32rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr;
    gap: 0 1rem;
  }

  .banner {
    grid-column: 1/3;
    grid-row: 1/2;
    margin-bottom: 1rem;
  }
  .privateWarning {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .fields {
    flex: 1 1 auto;
    display: flex;
    padding: var(--font-md, 1rem);
    flex-direction: column;
    gap: var(--font-md, 1rem);
    flex: 1 0 0;
    align-self: stretch;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2);
    background: var(--gray-1);
    overflow-y: auto;
  }

  .right,
  .left {
    display: flex;
    flex-direction: column;
    flex: 1 1 12rem;
    grid-row: 2/3;
    min-width: 0;
  }
  .right {
    flex: 2 1 24rem;
  }
  .right header {
    padding: 0.375rem 0;
    /* margin-bottom: .25rem; */
  }
  .right main {
    min-height: 0;
    height: 100%;
    width: 100%;
  }

  iframe.embed {
    height: 100%;
    width: 100%;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2);
  }
</style>
