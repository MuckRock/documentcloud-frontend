<script module lang="ts">
  import type { Access, Document, Note } from "$lib/api/types";

  interface NoteOption {
    value: string | number;
    label: string;
  }

  /** How restrictive each access level is, most permissive first */
  const RESTRICTION: Record<Access, number> = {
    public: 0,
    organization: 1,
    private: 2,
  };
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import {
    Check16,
    File16,
    Hash16,
    Note16,
    Sliders16,
    ShieldLock24,
    Organization24,
  } from "svelte-octicons";

  import Banner from "$lib/components/common/Banner.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import Copy from "../common/Copy.svelte";
  import CustomizeEmbed, {
    embedSettings,
  } from "../documents/CustomizeEmbed.svelte";
  import Field from "$lib/components/common/Field.svelte";
  import FieldLabel from "$lib/components/common/FieldLabel.svelte";
  import NumberInput from "$lib/components/inputs/Number.svelte";
  import Select from "$lib/components/inputs/Select.svelte";
  import Tab from "$lib/components/common/Tab.svelte";
  import Text from "$lib/components/inputs/Text.svelte";
  import TextArea from "$lib/components/inputs/TextArea.svelte";

  import Share from "$lib/components/layouts/Share.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import EditAccess from "$lib/components/forms/EditAccess.svelte";
  import EditNoteAccess from "$lib/components/forms/EditNoteAccess.svelte";

  import {
    canonicalPageUrl,
    canonicalUrl,
    edited,
    embedUrl,
    pageUrl,
  } from "$lib/api/documents";
  import * as embed from "$lib/api/embed";
  import { noteUrl, canonicalNoteUrl } from "$lib/api/notes";
  import { createEmbedSearchParams } from "$lib/utils/embed";
  import { documentDefaults } from "$lib/utils/embedConfig";
  import { onMount } from "svelte";

  interface Props {
    document: Document;
    page?: number;
    note_id?: undefined | string | number;
    currentTab?: "document" | "page" | "note";
    /** Override preview iframe contents; used in stories/tests to avoid a live embed request */
    previewSrcdoc?: string;
  }

  let {
    document,
    page = $bindable(1),
    note_id = $bindable(undefined),
    currentTab = $bindable("document"),
    previewSrcdoc,
  }: Props = $props();

  let noteOptions = $derived(
    document.notes?.map<NoteOption>((note) => ({
      value: note.id,
      label: `pg. ${note.page_number + 1} – ${note.title}`,
    })),
  );

  let notes = $derived(document.notes || []);
  let note = $derived(
    note_id ? notes?.find((n) => n.id === note_id) : notes[0],
  );

  let customizeEmbedOpen = $state(false);
  let editOpen = $state(false);

  // `document.notes` doesn't hear about our own note edits, so track them here
  // the way the `edited` store tracks document edits.
  let noteEdits: Record<string, Access> = $state({});

  let access = $derived(
    $edited.get(String(document.id))?.access ?? document.access,
  );
  let noteAccess = $derived(
    note ? (noteEdits[String(note.id)] ?? note.access) : undefined,
  );

  /**
   * Which resource the access warning is about.
   *
   * A note embed is only as visible as the more restrictive of the note and
   * the document it lives on, so on the note tab we warn about whichever that
   * is. Fixing it surfaces the other one, if there is one.
   */
  let warning = $derived.by(() => {
    if (
      currentTab === "note" &&
      note &&
      noteAccess &&
      RESTRICTION[noteAccess] >= RESTRICTION[access]
    ) {
      return {
        kind: "note" as const,
        access: noteAccess,
        canEdit: Boolean(note.edit_access),
      };
    }

    return {
      kind: "document" as const,
      access,
      canEdit: Boolean(document.edit_access),
    };
  });

  // captured when the modal opens so switching tabs behind it can't swap forms
  let editTarget: "document" | "note" = $state("document");
  let embedUrlParams = $derived(
    createEmbedSearchParams($embedSettings, documentDefaults),
  );

  // permalink, embed src, and iframe snippet for the selected tab
  let links = $derived.by(() => {
    switch (currentTab) {
      case "document":
        return {
          permalink: canonicalUrl(document),
          embedSrc: embedUrl(document, embedUrlParams),
          iframe: embed.document(document, embedUrlParams),
        };
      case "page": {
        const embedSrc = canonicalPageUrl(document, page, true);
        embedSrc.searchParams.set("embed", "1");
        return {
          permalink: pageUrl(document, page),
          embedSrc,
          iframe: embed.page(document, page),
        };
      }
      case "note": {
        if (!note)
          return {
            permalink: undefined,
            embedSrc: undefined,
            iframe: undefined,
          };
        const embedSrc = canonicalNoteUrl(document, note);
        embedSrc.searchParams.set("embed", "1");
        return {
          permalink: noteUrl(document, note),
          embedSrc,
          iframe: embed.note(document, note),
        };
      }
    }
  });

  let permalink = $derived(links?.permalink);
  let embedSrc = $derived(links?.embedSrc);
  let iframe = $derived(links?.iframe);

  onMount(() => {
    if (!note_id) {
      // try to set a default note
      note_id = document.notes ? document.notes[0]?.id : undefined;
    }
  });

  function closeEditing() {
    editOpen = false;
  }

  function openEditing() {
    editTarget = warning.kind;
    editOpen = true;
  }

  function onNoteUpdated(updated: Note) {
    noteEdits[String(updated.id)] = updated.access;
  }
</script>

{#snippet action()}
  {#if warning.canEdit}
    <Button mode="danger" size="small" onclick={openEditing}>
      {$_("share.privateFix")}
    </Button>
  {/if}
{/snippet}

{#snippet banner()}
  {#if warning.access === "private"}
    <Banner
      mode="danger"
      message={$_("share.privateWarning", {
        values: { type: $_(`share.types.${warning.kind}`) },
      })}
      {action}
    >
      {#snippet icon()}<ShieldLock24 />{/snippet}
    </Banner>
  {:else if warning.access === "organization"}
    <Banner
      mode="premium"
      message={warning.kind === "note"
        ? $_("share.noteOrgWarning")
        : $_("share.orgWarning", {
            values: { type: $_("share.types.document") },
          })}
      {action}
    >
      {#snippet icon()}<Organization24 />{/snippet}
    </Banner>
  {/if}
{/snippet}

<Share banner={warning.access === "public" ? undefined : banner}>
  {#snippet fields()}
    <div class="tabs" role="tablist">
      <Tab
        onclick={() => (currentTab = "document")}
        active={currentTab === "document"}
      >
        <File16 />
        {$_("share.document")}
      </Tab>
      <Tab onclick={() => (currentTab = "page")} active={currentTab === "page"}>
        <Hash16 />
        {$_("share.page")}
      </Tab>
      <Tab
        onclick={() => (currentTab = "note")}
        active={currentTab === "note"}
        disabled={!document.notes || document.notes.length === 0}
      >
        <Note16 />
        {$_("share.note")}
      </Tab>
    </div>
    <fieldset class={currentTab}>
      {#if currentTab === "page"}
        <div class="subselection">
          <Field>
            <FieldLabel>{$_("share.fields.page")}:</FieldLabel>
            <NumberInput bind:value={page} min={1} max={document.page_count} />
          </Field>
        </div>
      {:else if currentTab === "note" && noteOptions && noteOptions.length > 0}
        <div class="subselection">
          <Field>
            <FieldLabel>{$_("share.fields.note")}:</FieldLabel>
            <Select
              name="note"
              options={noteOptions}
              value={note_id}
              onChange={({ value }) => {
                note_id = value;
              }}
            />
          </Field>
        </div>
      {/if}
      <Field>
        <FieldLabel>
          {$_("share.permalink")}
          {#snippet action()}<Copy text={permalink?.href ?? ""} />{/snippet}
        </FieldLabel>
        <Text
          value={permalink?.href}
          --font-family="var(--font-mono)"
          --font-size="var(--font-sm)"
        />
      </Field>

      <Field>
        <FieldLabel>
          {$_("share.embed")}
          {#snippet action()}<Copy text={embedSrc?.href ?? ""} />{/snippet}
        </FieldLabel>
        <Text
          value={embedSrc?.href}
          --font-family="var(--font-mono)"
          --font-size="var(--font-sm)"
        />
      </Field>

      <Field>
        <FieldLabel>
          {$_("share.iframe")}
          {#snippet action()}<Copy text={iframe ?? ""} />{/snippet}
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
                disabled={currentTab !== "document"}
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
      {:else if previewSrcdoc}
        <iframe class="embed" title="Embed Preview" srcdoc={previewSrcdoc}
        ></iframe>
      {:else}
        <iframe class="embed" title="Embed Preview" src={embedSrc?.toString()}
        ></iframe>
      {/if}
    </main>
  {/snippet}
</Share>

{#if editOpen}
  <Portal>
    <Modal onclose={closeEditing}>
      {#snippet title()}
        <h1>
          {editTarget === "note" ? $_("access.editNote") : $_("access.edit")}
        </h1>
      {/snippet}
      {#if editTarget === "note" && note}
        <EditNoteAccess
          {document}
          {note}
          onclose={closeEditing}
          onsuccess={onNoteUpdated}
        />
      {:else}
        <EditAccess {document} onclose={closeEditing} />
      {/if}
    </Modal>
  </Portal>
{/if}

<style>
  .tabs {
    display: flex;
    gap: 0.5rem;
    flex: 0 1 auto;
    padding: 0 1rem;
  }
  .subselection {
    background: var(--white);
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2);
    box-shadow: var(--shadow-1);
  }
</style>
