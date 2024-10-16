<!-- @component
Invite a new collaborator to a project
-->
<script lang="ts">
  import type { Project, ValidationError } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Field from "../inputs/Field.svelte";
  import Text from "../inputs/Text.svelte";
  import ProjectAccess from "../inputs/ProjectAccess.svelte";

  import { canonicalUrl } from "$lib/api/projects";

  const dispatch = createEventDispatcher();

  export let project: Project;

  let errors: ValidationError = {};

  $: action = new URL("?/invite", canonicalUrl(project)).href;

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

<form {action} method="post" use:enhance={onSubmit}>
  <Field
    title={$_("common.emailAddress")}
    sronly
    required
    description={$_("collaborators.invite.message")}
  >
    <Text name="email" placeholder={$_("common.emailAddress")} required />
    <svelte:fragment slot="error">
      {#if errors.email}
        <p class="error">
          {@html errors.email.join("\n")}
        </p>
      {/if}
    </svelte:fragment>
  </Field>

  <ProjectAccess name="access" />

  <Flex class="buttons">
    <Button type="submit" mode="primary">{$_("collaborators.add")}</Button>
    <Button on:click={() => dispatch("close")}>{$_("dialog.cancel")}</Button>
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
  }
</style>
