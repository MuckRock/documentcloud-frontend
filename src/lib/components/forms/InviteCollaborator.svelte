<!-- @component
Invite a new collaborator to a project
-->
<script lang="ts">
  import type { Project, ValidationError } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Field from "../inputs/Field.svelte";
  import Text from "../inputs/Text.svelte";
  import ProjectAccess from "../inputs/ProjectAccess.svelte";

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
    title={$_("common.emailAddress")}
    sronly
    required
    description={$_("collaborators.invite.message")}
  >
    <Text name="email" placeholder={$_("common.emailAddress")} required />
    {#snippet error()}
      {#if errors.email}
        <p class="error">
          {@html errors.email.join("\n")}
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
</style>
