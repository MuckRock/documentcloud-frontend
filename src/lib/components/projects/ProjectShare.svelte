<script lang="ts">
  import type { Project } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { ShieldLock24, Check16, Sliders16 } from "svelte-octicons";

  import Banner from "$lib/components/common/Banner.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import Copy from "../common/Copy.svelte";
  import CustomizeEmbed, {
    embedSettings,
  } from "$lib/components/projects/CustomizeProjectEmbed.svelte";
  import Field from "$lib/components/common/Field.svelte";
  import FieldLabel from "$lib/components/common/FieldLabel.svelte";
  import Text from "$lib/components/inputs/Text.svelte";
  import TextArea from "$lib/components/inputs/TextArea.svelte";

  import Share from "$lib/components/layouts/Share.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import EditProject from "$lib/components/forms/EditProject.svelte";

  import { canonicalUrl, embedUrl } from "$lib/api/projects";
  import * as embed from "$lib/api/embed";
  import { createEmbedSearchParams } from "$lib/utils/embed";
  import { projectDefaults } from "$lib/utils/embedConfig";

  interface Props {
    project: Project;
  }

  let { project }: Props = $props();

  let editing = $state(false);
  let customizeEmbedOpen = $state(false);

  let isPrivate = $derived(project.private);
  let permalink = $derived(canonicalUrl(project));
  let embedUrlParams = $derived(
    createEmbedSearchParams($embedSettings, projectDefaults),
  );
  let embedSrc = $derived(embedUrl(project, embedUrlParams));
  let iframe = $derived(embed.project(project, embedUrlParams));

  function closeEditing() {
    editing = false;
  }
  function openEditing() {
    editing = true;
  }
</script>

{#snippet banner()}
  <Banner
    mode="danger"
    message={$_("share.privateWarning", {
      values: { type: $_("share.types.project") },
    })}
  >
    {#snippet icon()}<ShieldLock24 />{/snippet}
    {#snippet action()}
      {#if project.edit_access}
        <Button mode="danger" size="small" onclick={openEditing}>
          {$_("share.privateFix")}
        </Button>
      {/if}
    {/snippet}
  </Banner>
{/snippet}

<Share banner={isPrivate ? banner : undefined}>
  {#snippet fields()}
    <fieldset>
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
    </fieldset>
  {/snippet}

  {#snippet preview()}
    <header>
      <FieldLabel>
        {$_("share.preview")}
        {#snippet action()}
          <div>
            {#if customizeEmbedOpen}
              <Button
                size="small"
                ghost
                mode="primary"
                onclick={() => (customizeEmbedOpen = false)}
              >
                <Check16 />
                {$_("share.save")}
              </Button>
            {:else}
              <Button
                size="small"
                ghost
                mode="primary"
                onclick={() => (customizeEmbedOpen = true)}
              >
                <Sliders16 />
                {$_("share.customize")}
              </Button>
            {/if}
          </div>
        {/snippet}
      </FieldLabel>
    </header>

    <main>
      {#if customizeEmbedOpen}
        <CustomizeEmbed />
      {:else}
        <iframe title="Embed Preview" src={embedSrc.href}></iframe>
      {/if}
    </main>
  {/snippet}
</Share>

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
