<!-- @component
Invite a new collaborator to a project
-->
<script lang="ts">
  import type { Project } from "$lib/api/types";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Field from "../inputs/Field.svelte";
  import Text from "../inputs/Text.svelte";
  import ProjectAccess from "../inputs/ProjectAccess.svelte";

  import { canonicalUrl } from "$lib/api/projects";

  export let project: Project;

  const dispatch = createEventDispatcher();

  $: action = new URL("?/invite", canonicalUrl(project)).href;
</script>

<form {action} method="post">
  <Field
    title={$_("common.emailAddress")}
    sronly
    required
    description={$_("collaborators.invite.message")}
  >
    <Text name="email" placeholder={$_("common.emailAddress")} required />
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
</style>
