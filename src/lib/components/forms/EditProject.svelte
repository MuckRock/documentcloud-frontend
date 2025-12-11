<!-- @component
Edit project metadata
-->
<script lang="ts">
  import type { Project } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Field from "../inputs/Field.svelte";
  import Flex from "../common/Flex.svelte";
  import Switch from "../inputs/Switch.svelte";
  import Text from "../inputs/Text.svelte";
  import TextArea from "../inputs/TextArea.svelte";

  import { pinned } from "$lib/components/projects/ProjectPin.svelte";

  import { canonicalUrl } from "$lib/api/projects";

  export let project: Partial<Project> = {};

  const dispatch = createEventDispatcher();

  $: action = project?.id
    ? new URL("?/edit", canonicalUrl(project as Project)).href
    : "/projects/";

  // handle optimistic updates
  $: is_pinned = $pinned.includes(project as Project) || project.pinned;

  function onSubmit({ submitter }) {
    submitter.disabled = true;
    return ({ result, update }) => {
      if (result.type === "success") {
        dispatch("success", result.data?.project?.data);
      }
      update(result);
      dispatch("close");
    };
  }
</script>

<form {action} method="post" use:enhance={onSubmit}>
  <Flex direction="column" gap={1}>
    <Field title={$_("projects.fields.title")} required>
      <Text
        name="title"
        placeholder={$_("projects.fields.title")}
        value={project.title}
        required
      />
    </Field>
    <Field title={$_("projects.fields.description")}>
      <TextArea name="description" value={project.description} />
    </Field>
    <Field title={$_("projects.fields.private")} inline>
      <Switch name="private" checked={project.private} />
    </Field>
    <Field title={$_("projects.fields.pinned")} inline>
      <Switch name="pinned" checked={is_pinned} />
    </Field>

    <Flex class="buttons">
      {#if project?.id}
        <Button type="submit" mode="primary" full>{$_("edit.save")}</Button>
      {:else}
        <Button type="submit" mode="primary" full>
          {$_("projects.create")}
        </Button>
      {/if}
      <Button full on:click={(e) => dispatch("close")}>
        {$_("edit.cancel")}
      </Button>
    </Flex>
  </Flex>
</form>

<style>
  form {
    width: 100%;
    padding: 1rem;
  }
</style>
