<!--
  @component
  A single note, either overlaid on a document or on its own.
  It has two states, focused and normal.
-->
<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { User } from "@/api/types/orgAndUser";
  import type { Note, ViewerMode } from "$lib/api/types";

  import DOMPurify from "isomorphic-dompurify";
  import { getContext } from "svelte";

  import { _ } from "svelte-i18n";
  import {
    Globe16,
    Lock16,
    Pencil16,
    People16,
    Trash16,
  } from "svelte-octicons";
  import Action from "../common/Action.svelte";

  import { noteHashUrl, width, height } from "$lib/api/notes";
  import { pageHashUrl } from "$lib/api/documents";

  export let note: Note;
  export let focused = false;

  const ALLOWED_TAGS = ["a", "strong", "em", "b", "i"];
  const ALLOWED_ATTR = ["href"];

  const access = {
    private: {
      value: $_("access.private.value"),
      title: $_("access.private.title"),
      icon: Lock16,
    },
    organization: {
      value: $_("access.organization.value"),
      title: $_("access.organization.title"),
      icon: People16,
    },
    public: {
      value: $_("access.public.value"),
      title: $_("access.public.title"),
      icon: Globe16,
    },
  };

  const mode: Writable<ViewerMode> = getContext("mode");

  $: id = noteHashUrl(note).replace("#", "");
  $: href = noteHashUrl(note);
  $: page_number = note.page_number + 1; // note pages are 0-indexed
  $: user = typeof note.user === "object" ? (note.user as User) : null;

  function clean(html: string) {
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS,
      ALLOWED_ATTR,
    });
  }
</script>

{#if focused}
  <div
    {id}
    class="note focused {note.access} {$mode || 'notes'}"
    style:--x1={note.x1}
    style:--x2={note.x2}
    style:--y1={note.y1}
    style:--y2={note.y2}
    style:--width={width(note)}
    style:--height={height(note)}
  >
    <header>
      <h3>{note.title}</h3>
      <div class="actions">
        {#if note.edit_access}
          <Action icon={Pencil16}>{$_("dialog.edit")}</Action>
          <Action --color="var(--red)" --fill="var(--red)" icon={Trash16}
            >{$_("dialog.delete")}</Action
          >
        {/if}
      </div>
    </header>
    <div class="excerpt">
      <h4 {id}>
        <a href={pageHashUrl(page_number)}>
          {$_("documents.pageAbbrev")}
          {page_number}
        </a>
      </h4>

      <div class="highlight"></div>
    </div>
    <div class="content">
      <p>{@html clean(note.content)}</p>
    </div>
    <footer>
      {#if note.edit_access}
        <label class="access">
          <svelte:component this={access[note.access].icon} />
          <span class="sr-only">{$_("access.access")}</span>
          <select name="access" value={note.access}>
            {#each Object.values(access) as opt}
              <option value={opt.value}>{opt.title}</option>
            {/each}
          </select>
        </label>
      {:else}
        <span class="access {note.access}">
          <svelte:component this={access[note.access].icon} />
          {$_(`access.${access[note.access].value}.title`)}
        </span>
      {/if}

      {#if user}
        <p class="author">
          {$_("annotation.by", { values: { name: user.name } })}
        </p>
      {/if}
    </footer>
  </div>
{:else}
  <a
    data-sveltekit-replacestate
    {href}
    class="note {note.access}"
    title={note.title}
    style:top="{note.y1 * 100}%"
    style:left="{note.x1 * 100}%"
    style:width="{width(note) * 100}%"
    style:height="{height(note) * 100}%"
  >
    {note.title}
  </a>
{/if}

<style>
  /* overlay mode */
  a.note {
    border-radius: 0.25rem;
    color: transparent;
    position: absolute;
    opacity: 0.5;
    pointer-events: all;
    mix-blend-mode: multiply;
  }

  a.note.public {
    background-color: var(--note-public);
  }

  a.note.private {
    background-color: var(--note-private);
    border-color: var(--note-private);
  }

  a.note.organization {
    background-color: var(--note-org);
    border-color: var(--note-org);
  }

  /* focused mode */
  .focused {
    display: flex;
    width: 38.0625rem;
    padding: var(--font-xs, 0.75rem) var(--font-md, 1rem);
    flex-direction: column;
    align-items: flex-start;
    gap: var(--font-xs, 0.75rem);
    pointer-events: all;

    border-radius: 0.5rem;
    border: 1px solid var(--gray-2, #d8dee2);
    background: var(--white, #fff);

    /* shadow-2 */
    box-shadow: 0px 2px 8px 2px var(--shadow, rgba(30, 48, 56, 0.15));
  }

  /* overlay */
  .focused.document {
    position: absolute;
    top: calc(var(--y1) * 100%);
    left: calc(var(--x1) * 100%);
  }

  .focused header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
  }

  .actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--font-md, 1rem);
  }

  .excerpt {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    align-self: stretch;
  }

  .highlight {
    height: 4.25rem;
    align-self: stretch;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2, #d8dee2);
    background: var(--gray-1, #f5f6f7);
  }

  h4,
  h4 a {
    color: var(--gray-4, #5c717c);
    text-decoration: none;
    font-weight: var(--font-regular);
  }

  h4 a:hover {
    text-decoration: underline;
  }

  footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
  }

  footer p {
    color: var(--gray-4, #5c717c);
    font-size: var(--font-s);
  }

  label.access {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  label.access select {
    border: none;
    font-family: var(--font-sans);
    font-size: var(--font-s);
  }

  span.access {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-s);
  }

  /* yellow doesn't give enough contrast
  span.access.public {
    background-color: var(--note-public);
  }
  */

  span.access.organization {
    color: var(--note-org);
    fill: var(--note-org);
  }

  span.access.private {
    color: var(--note-private);
    fill: var(--note-private);
  }
</style>
