<!-- @component
Remove a collaborator from a project
-->
<script lang="ts">
  import type { Project, ProjectUser, ValidationError } from "$lib/api/types";

  import { enhance } from "$app/forms";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";

  import { canonicalUrl } from "$lib/api/projects";
  import { getUserName } from "$lib/api/accounts";

  interface Props {
    project: Project;
    user: ProjectUser;
    onclose?: () => void;
  }

  let { project, user, onclose }: Props = $props();

  let errors: ValidationError = $state({});

  let action = $derived(new URL("?/remove", canonicalUrl(project)).href);
  let name = $derived(getUserName(user.user));
  let title = $derived(project.title);

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
  <p>{$_("collaborators.remove.message", { values: { name, title } })}</p>
  <input type="hidden" name="user" value={user.user.id} />
  <Flex class="buttons">
    <Button type="submit" mode="danger">{$_("dialog.remove")}</Button>
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
</style>
