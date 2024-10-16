<!-- @component
Remove a collaborator from a project
-->
<script lang="ts">
  import type { Project, ProjectUser } from "$lib/api/types";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";

  import { canonicalUrl } from "$lib/api/projects";
  import { getUserName } from "$lib/api/accounts";

  export let project: Project;
  export let user: ProjectUser;

  const dispatch = createEventDispatcher();

  $: action = new URL("?/remove", canonicalUrl(project)).href;
  $: name = getUserName(user.user);
  $: title = project.title;
</script>

<form {action} method="post">
  <p>{$_("collaborators.remove.message", { values: { name, title } })}</p>
  <input type="hidden" name="user" value={user.user.id} />
  <Flex class="buttons">
    <Button type="submit" mode="danger">{$_("dialog.remove")}</Button>
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
