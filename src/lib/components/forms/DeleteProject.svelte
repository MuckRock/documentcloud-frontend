<!-- @component
Confirm project deletion.
-->
<script lang="ts">
  import type { Project } from "$lib/api/types";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { Trash16 } from "svelte-octicons";

  import Flex from "../common/Flex.svelte";
  import Button from "../common/Button.svelte";

  import { canonicalUrl } from "$lib/api/projects";

  export let project: Project;

  const dispatch = createEventDispatcher();

  $: action = new URL("?/delete", canonicalUrl(project)).href;
</script>

<form {action} method="post">
  <p>{$_("projects.delete.really", { values: { project: project.title } })}</p>

  <Flex>
    <Button type="submit" mode="danger">
      <Trash16 />
      {$_("delete.confirm")}
    </Button>
    <Button on:click={() => dispatch("close")}>
      {$_("delete.cancel")}
    </Button>
  </Flex>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
</style>
