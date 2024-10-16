<!-- @component
Update permissions for a single collaborator on a project
-->
<script context="module" lang="ts">
  import type { Project, ProjectUser } from "$lib/api/types";
</script>

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import ProjectAccess from "../inputs/ProjectAccess.svelte";

  import { canonicalUrl } from "$lib/api/projects";
  import { getUserName } from "$lib/api/accounts";

  const dispatch = createEventDispatcher();

  export let project: Project;
  export let user: ProjectUser;

  $: action = new URL("?/update", canonicalUrl(project)).href;
  $: name = getUserName(user.user);
  $: title = project.title;
</script>

<form {action} method="post">
  <p>{$_("collaborators.update.message", { values: { name, title } })}</p>

  <input type="hidden" name="user" value={user.user.id} />
  <ProjectAccess name="access" bind:selected={user.access} />

  <Flex class="buttons">
    <Button type="submit" mode="primary">{$_("dialog.update")}</Button>
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
