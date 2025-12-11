<!-- @component
Remove a collaborator from a project
-->
<script lang="ts">
  import type { Project, ProjectUser, ValidationError } from "$lib/api/types";

  import { enhance } from "$app/forms";
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";

  import { canonicalUrl } from "$lib/api/projects";
  import { getUserName } from "$lib/api/accounts";

  export let project: Project;
  export let user: ProjectUser;

  const dispatch = createEventDispatcher();

  let errors: ValidationError = {};

  $: action = new URL("?/remove", canonicalUrl(project)).href;
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

<form class="modal-form--flex" {action} method="post" on:submit={onSubmit}>
  <p>{$_("collaborators.remove.message", { values: { name, title } })}</p>
  <input type="hidden" name="user" value={user.user.id} />
  <Flex class="buttons">
    <Button type="submit" mode="danger">{$_("dialog.remove")}</Button>
    <Button on:click={() => dispatch("close")}>{$_("dialog.cancel")}</Button>
  </Flex>
</form>
