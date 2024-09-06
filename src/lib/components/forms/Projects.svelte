<!-- @component
Add to and remove from projects.
This component can work entirely in the client,
because it needs to load all of a user's projects 
and we don't want to do that everywhere.
-->
<script lang="ts">
  import type { Document, Project } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Field from "../inputs/Field.svelte";
  import Flex from "../common/Flex.svelte";
  import Switch from "../inputs/Switch.svelte";
  import Text from "../inputs/Text.svelte";
  import TextArea from "../inputs/TextArea.svelte";

  import { intersection } from "@/util/array.js";

  export let documents: Document[];
  export let projects: Project[];

  const dispatch = createEventDispatcher();

  $: common = new Set(
    intersection(
      documents.map((d) => d.projects),
      (a, b) => {
        return a.id === b.id;
      },
    ),
  );

  $: console.log(common);
</script>

<form method="post" action="/documents/projects/" use:enhance>
  <Flex direction="column">
    <h2>{$_("projects.create")}</h2>
    <Field title={$_("projects.fields.title")} required inline>
      <Text name="title" placeholder={$_("projects.fields.title")} />
    </Field>

    <details>
      <summary>{$_("common.more")} &hellip;</summary>
      <Flex direction="column">
        <Field title={$_("projects.fields.description")}>
          <TextArea name="description" />
        </Field>
        <Field title={$_("projects.fields.private")} inline>
          <Switch name="private" />
        </Field>
        <Field title={$_("projects.fields.pinned")} inline>
          <Switch name="pinned" checked />
        </Field>
      </Flex>
    </details>
    <Button mode="primary" type="submit">{$_("projects.add")} +</Button>
  </Flex>
  <hr class="divider" />
  <Flex direction="column" class="projects">
    {#each projects as project}
      <label class="project">
        <input
          type="checkbox"
          name="project"
          value={project.id}
          checked={common.has(project.id)}
        />
        {project.title}
      </label>
    {/each}
  </Flex>
  <hr class="divider" />
  <Flex class="buttons">
    <Button on:click={() => dispatch("close")}>{$_("dialog.done")}</Button>
  </Flex>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  details {
    cursor: pointer;
  }

  summary {
    cursor: pointer;
    margin-bottom: 0.5rem;
  }
</style>
