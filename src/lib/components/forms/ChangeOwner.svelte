<!-- @component
Change owner of one or more documents.
-->
<script lang="ts">
  import type { APIError, Document, Maybe, Org, User } from "$lib/api/types";

  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";

  import { createEventDispatcher, onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import { Alert24 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import ShowSize from "../common/ShowSize.svelte";
  import Tip from "../common/Tip.svelte";
  import Select from "../inputs/Select.svelte";

  import { MAX_EDIT_BATCH } from "@/config/config.js";
  import { getCurrentUser } from "$lib/utils/permissions";
  import { canonicalUrl } from "$lib/api/documents";
  import { userOrgs, orgUsers, getUserName, isOrg } from "$lib/api/accounts";

  const me = getCurrentUser();

  // one document or a list of documents
  export let documents: Document[] = [];

  const dispatch = createEventDispatcher();

  let error: Maybe<APIError<null>> = undefined;
  let user: Maybe<{ value: number; label: string; user?: User }> = undefined;
  let org: Maybe<{ value: number; label: string; org?: Org }> =
    $me && isOrg($me.organization)
      ? { value: $me.organization.id, label: $me.organization.name }
      : undefined;

  let userOptions: Promise<{ value: number; label: string; user?: User }[]> =
    Promise.resolve([]);
  let orgOptions: { value: number; label: string; org?: Org }[] = org
    ? [org]
    : [];
  let loading = true;

  $: ids = documents.map((d) => d.id);
  $: bulk = documents.length !== 1;
  $: count = documents.length;
  $: disabled =
    count > MAX_EDIT_BATCH || count === 0 || !$me || (!user && !org);
  $: action = bulk
    ? "/documents/?/change_owner"
    : documents[0]
      ? canonicalUrl(documents[0]).href + "?/change_owner"
      : "";

  $: userOptions = getUserOptions(org?.org);

  onMount(async () => {
    if ($me) {
      // Load organizations the user belongs to
      orgOptions = await getOrgOptions($me);

      // don't await, because we expect this to be a promise
      // userOptions = getUserOptions($me.organization as Org);
    }
    loading = false;
  });

  async function getOrgOptions(
    me: User,
  ): Promise<{ value: number; label: string; org: Org }[]> {
    const orgs = await userOrgs(me);
    return orgs.map((org) => ({
      value: org.id,
      label: org.individual ? `${org.name} (individual)` : org.name,
      org,
    }));
  }

  async function getUserOptions(
    org: Maybe<Org>,
  ): Promise<{ label: string; value: number; user: User }[]> {
    if (!org || org.individual) return [];

    const users = await orgUsers(org);

    return users.map((user) => ({
      label: getUserName(user),
      value: user.id,
      user,
    }));
  }

  /**
   * @type {import('@sveltejs/kit').SubmitFunction}
   */
  function onSubmit({ formData, cancel, submitter }) {
    submitter.disabled = true;
    if (!$me) {
      return cancel();
    }
    if (org) {
      formData.set("organization", org?.value);
    }
    if (user) {
      formData.set("user", user?.value);
    }

    return ({ result }) => {
      console.log(result);
      switch (result.type) {
        case "error":
          error = result.data.error;
          submitter.disabled = false;
          break;

        case "success":
          dispatch("close");
          invalidateAll();
          submitter.disabled = false;
          break;

        case "redirect":
          dispatch("close");
          invalidateAll();
          break;
      }
    };
  }
</script>

<form {action} method="post" use:enhance={onSubmit}>
  <Flex direction="column" gap={1}>
    <ShowSize size={count}>
      <Flex direction="column">
        <h2>{$_("change_owner.really", { values: { n: count } })}</h2>
        <Tip mode="danger">
          <Alert24 slot="icon" />
          {$_("change_owner.continue", { values: { n: count } })}
        </Tip>
      </Flex>
      <Tip mode="danger" slot="oversize">
        <Alert24 slot="icon" />
        {$_("change_owner.toomany", { values: { n: MAX_EDIT_BATCH } })}
      </Tip>
      <p slot="empty">{$_("change_owner.none")}</p>
    </ShowSize>

    {#if loading}
      <p>{$_("common.loading")}</p>
    {:else}
      <Flex direction="column" gap={0.5}>
        <label for="org-select">
          {$_("change_owner.org_label")}
        </label>
        <Select
          name="organization"
          items={orgOptions}
          bind:value={org}
          placeholder={$_("change_owner.org_placeholder")}
          clearable
        />
        {#await userOptions then items}
          <label for="user-select">
            {$_("change_owner.user_label")}
          </label>
          <Select
            name="user"
            {items}
            bind:value={user}
            placeholder={$_("change_owner.user_placeholder")}
            clearable
          />
        {/await}

        <p class="help-text">{$_("change_owner.help")}</p>
      </Flex>
    {/if}

    {#if error}
      <p class="error">
        <span>{$_("change_owner.error")}:</span>
        {error.message}
      </p>
    {/if}

    <input type="hidden" name="documents" value={ids.join(",")} />

    <Flex>
      <Button type="submit" mode="primary" {disabled}>
        {$_("change_owner.confirm")}
      </Button>
      <Button on:click={() => dispatch("close")}>
        {$_("change_owner.cancel")}
      </Button>
    </Flex>
  </Flex>
</form>

<style>
  form {
    color: var(--gray-5, #233944);
    width: 100%;
  }

  label {
    font-weight: 500;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  .help-text {
    font-size: 0.85rem;
    color: var(--gray-4, #666);
    margin-top: 0.25rem;
  }

  .error {
    color: var(--red-5, #d32f2f);
    font-size: 0.9rem;
  }
</style>
