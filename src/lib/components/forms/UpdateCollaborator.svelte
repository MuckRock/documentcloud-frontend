<!-- @component
Update permissions for a single collaborator on a project
-->
<script context="module" lang="ts">
  import type { Project, ProjectUser, ValidationError } from "$lib/api/types";
</script>

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import { enhance } from "$app/forms";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import ProjectAccess from "../inputs/ProjectAccess.svelte";

  import { canonicalUrl } from "$lib/api/projects";
  import { getUserName } from "$lib/api/accounts";

  const dispatch = createEventDispatcher();

  export let project: Project;
  export let user: ProjectUser;

  let errors: ValidationError = {};

  $: action = new URL("?/update", canonicalUrl(project)).href;
  $: name = getUserName(user.user);
  $: title = project.title;

  /**
   * @type {import('@sveltejs/kit').SubmitFunction}
   */
  function onSubmit({ submitter }) {
    submitter.disabled = true;

    return ({ result, update }) => {
      if (result.type === "success") {
        dispatch("close");
        return update(result);
      }

      errors = result.data.errors;
      submitter.disabled = false;
    };
  }
</script>

<form class="modal-form--flex" {action} method="post" use:enhance={onSubmit}>
  <p>{$_("collaborators.update.message", { values: { name, title } })}</p>

  <input type="hidden" name="user" value={user.user.id} />
  <ProjectAccess name="access" bind:selected={user.access} />

  <Flex class="buttons">
    <Button type="submit" mode="primary">{$_("dialog.update")}</Button>
    <Button on:click={() => dispatch("close")}>{$_("dialog.cancel")}</Button>
  </Flex>
</form>
