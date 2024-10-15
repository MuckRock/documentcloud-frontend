<!-- @component 
Manage users on a project: add, update, remove

This component is actually two separate forms that travel together.
They might get separated later.
-->
<script lang="ts">
  import type {
    Project,
    ProjectAccess,
    ProjectUser,
    User,
  } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { Plus16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Field from "../inputs/Field.svelte";
  import Flex from "../common/Flex.svelte";
  import Text from "../inputs/Text.svelte";
  import Avatar from "../accounts/Avatar.svelte";

  import { canonicalUrl } from "$lib/api/projects";
  import { getUserName } from "$lib/api/accounts";

  export let project: Project;
  export let users: ProjectUser[];

  const dispatch = createEventDispatcher();

  // set to a user ID to trigger removal flow
  let remove: number | null = null;

  $: canonical = canonicalUrl(project);
  $: action = new URL("?/users", canonical).href;
  $: invite = new URL("?/invite", canonical).href;
  $: grouped = users.reduce(
    (m, { user, access }) => {
      m[access].push(user);
      return m;
    },
    { admin: [], edit: [], view: [] } satisfies Record<ProjectAccess, User[]>,
  );

  function sort(users: User[]) {
    return users.sort((a, b) => getUserName(a).localeCompare(getUserName(b)));
  }

  function onSubmit({ submitter }) {
    submitter.disabled = true;
    return async ({ result, update }) => {
      submitter.disabled = false;
      return update(result);
    };
  }
</script>

<Flex direction="column">
  <form action={invite} method="post" use:enhance={onSubmit}>
    <h2>{$_("collaborators.addCollaborators")}</h2>
    <p>{@html $_("collaborators.invite")}</p>
    <Flex align="center">
      <Field title={$_("common.emailAddress")} sronly required>
        <Text name="email" placeholder={$_("common.emailAddress")} required />
      </Field>
      <Field>
        <select name="access" class="access">
          <option value="view">{$_("collaborators.view")}</option>
          <option value="edit">{$_("collaborators.edit")}</option>
          <option value="admin">{$_("collaborators.admin")}</option>
        </select>
      </Field>
      <Button mode="primary" type="submit">
        <Plus16 />
        {$_("collaborators.add")}
      </Button>
    </Flex>
  </form>

  {#if users.length}
    <form {action} method="post" use:enhance>
      {#each Object.entries(grouped) as [access, group]}
        {#if group.length}
          <Flex direction="column" class="users {access}">
            <h2>{$_(`collaborators.${access}`)}</h2>
            <p class="help">
              {$_(`collaborators.help.${access}`)}
            </p>
            <table>
              <tr class="sr-only">
                <th>{$_("collaborators.name")}</th>
                <th>{$_("collaborators.access")}</th>
                <th>{$_("collaborators.remove.label")}</th>
              </tr>
              {#each sort(group) as user}
                <tr>
                  <td><Flex><Avatar {user} /> {getUserName(user)}</Flex></td>
                  <td>
                    <input type="hidden" name="user" value={user.id} />
                    <Field title={$_("collaborators.change")} sronly>
                      <select name="access" value={access}>
                        <option value="view">{$_("collaborators.view")}</option>
                        <option value="edit">{$_("collaborators.edit")}</option>
                        <option value="admin">
                          {$_("collaborators.admin")}
                        </option>
                      </select>
                    </Field>
                  </td>
                  <td>
                    <Button minW={false} ghost mode="danger">
                      {$_("collaborators.remove.label")}
                    </Button>
                  </td>
                </tr>
              {/each}
            </table>
          </Flex>
        {/if}
      {/each}
      <Flex class="buttons">
        <Button type="submit" mode="primary" full>{$_("dialog.save")}</Button>
        <Button full on:click={() => dispatch("close")}>
          {$_("dialog.done")}
        </Button>
      </Flex>
    </form>
  {/if}
</Flex>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  table {
    width: 100%;
    margin: 0;
    padding: 0;
    border-collapse: collapse;
    table-layout: fixed;
  }

  th,
  td {
    text-align: start;
    margin: 0;
    padding: 0.25rem;

    color: var(--gray-5, #233944);
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: var(--font-family, var(--font-sans, "Source Sans Pro"));
    font-size: var(--font-size, var(--font-md, 1rem));
    line-height: normal;
  }

  /* copied from Text.svelte */
  select {
    display: flex;
    padding: 0.375rem 0.75rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    width: 100%;

    border-radius: 0.5rem;
    border: 1px solid var(--gray-3, hwb(205 60% 30%));
    background: var(--white, #fff);
    box-shadow: 0px 2px 0px 0px var(--gray-2, #d8dee2) inset;

    color: var(--gray-5, #233944);
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: var(--font-family, var(--font-sans, "Source Sans Pro"));
    font-size: var(--font-size, var(--font-md, 1rem));
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
</style>
