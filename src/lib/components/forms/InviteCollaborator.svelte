<!-- @component
Invite a new collaborator to a project
-->
<script lang="ts">
  import { SQUARELET_BASE } from "@/config/config.js";
  import type { Project, SquareletUser, ValidationError } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Field from "../inputs/Field.svelte";
  import Select from "../inputs/Select.svelte";
  import ProjectAccess from "../inputs/ProjectAccess.svelte";
  import UserListItem from "./UserListItem.svelte";

  import { canonicalUrl } from "$lib/api/projects";

  interface Props {
    project: Project;
    onclose?: () => void;
  }

  let { project, onclose }: Props = $props();

  let errors: ValidationError = $state({});

  let action = $derived(new URL("?/invite", canonicalUrl(project)).href);

  /**
   * @type {import('@sveltejs/kit').SubmitFunction}
   */
  function onSubmit({ submitter }) {
    submitter.disabled = true;

    return ({ result, update }) => {
      if (result.type === "success") {
        onclose?.();
        return update(result);
      }

      errors = result.data.errors;
      submitter.disabled = false;
    };
  }
</script>

<form {action} method="post" use:enhance={onSubmit}>
  <Field
    title={$_("collaborators.invite.search")}
    sronly
    required
    description={$_("collaborators.invite.message")}
  >
    <Select
      name="user"
      valueField="uuid"
      placeholder={$_("collaborators.invite.search")}
      fetch="{SQUARELET_BASE}/fe_api/users/?search=[query]"
      fetchProps={{ credentials: "include" }}
      fetchCallback={({ results }) => results}
      searchProps={{ disabled: true }}
      fetchDebounceTime={400}
      minQuery={3}
      fetchResetOnBlur={false}
      resetOnBlur={false}
      lazyDropdown={false}
    >
      {#snippet option(item: SquareletUser)}
        <UserListItem user={item} />
      {/snippet}

      {#snippet selection(selectedOptions: SquareletUser[], bindItem: Function)}
        {#each selectedOptions as selection (selection.uuid)}
          <div class="chip">
            <UserListItem user={selection} />
            <button data-action="deselect" use:bindItem={selection}>
              &times;
            </button>
          </div>
        {/each}
      {/snippet}
    </Select>
    {#snippet error()}
      {#if errors.user}
        <p class="error">
          {@html errors.user.join("\n")}
        </p>
      {/if}
    {/snippet}
  </Field>

  <ProjectAccess name="access" />

  <Flex class="buttons">
    <Button type="submit" mode="primary">{$_("collaborators.add")}</Button>
    <Button onclick={() => onclose?.()}>{$_("dialog.cancel")}</Button>
  </Flex>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  .error {
    color: var(--error);
    font-size: var(--font-sm);
    font-weight: var(--font-semibold);
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    background: var(--blue-1, #eef3f9);
    border: 1px solid var(--blue-2, #b5ceed);
    color: var(--blue-5, #053775);
  }

  .chip button {
    all: unset;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    font-size: var(--font-md, 1rem);
    line-height: 1;
    color: inherit;
    opacity: 0.6;
  }

  .chip button:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.1);
  }
</style>
