<!-- @component
Edit project metadata
-->
<script lang="ts">
  import type { Project } from "$lib/api/types";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Field from "../inputs/Field.svelte";
  import Flex from "../common/Flex.svelte";
  import Switch from "../inputs/Switch.svelte";
  import Text from "../inputs/Text.svelte";
  import TextArea from "../inputs/TextArea.svelte";

  import { canonicalUrl } from "$lib/api/projects";

  export let project: Partial<Project> = {};

  const dispatch = createEventDispatcher();

  $: action = project?.id
    ? new URL("?/edit", canonicalUrl(project as Project)).href
    : "/documents/projects/";
</script>

<form {action} method="post">
  <Flex direction="column" gap={1}>
    <Field title={$_("projects.fields.title")} required>
      <Text
        name="title"
        placeholder={$_("projects.fields.title")}
        value={project.title}
      />
    </Field>
    <Field title={$_("projects.fields.description")}>
      <TextArea name="description" value={project.description} />
    </Field>
    <Field title={$_("projects.fields.private")} inline>
      <Switch name="private" checked={project.private} />
    </Field>
    <Field title={$_("projects.fields.pinned")} inline>
      <Switch name="pinned" checked={project.pinned ?? true} />
    </Field>

    <Flex class="buttons">
      <Button type="submit" mode="primary" full>{$_("edit.save")}</Button>
      <Button full on:click={(e) => dispatch("close")}>
        {$_("edit.cancel")}
      </Button>
    </Flex>
  </Flex>
</form>

<style>
  form {
    width: 100%;
  }
</style>
