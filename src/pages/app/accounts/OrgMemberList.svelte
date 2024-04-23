<script lang="ts">
  import { _ } from "svelte-i18n";
  import { People24, Person16 } from "svelte-octicons";

  import Loader from "../../../common/Loader.svelte";
  import Error from "../../../common/icons/Error.svelte";
  import Link from "../../../router/Link.svelte";
  import Button from "../../../common/Button.svelte";

  import { userUrl } from "../../../search/search.js";
  import { inMyOrg } from "../../../manager/orgsAndUsers.js";

  export let orgId;
  export let myId;

  async function loadUsers(oId) {
    return inMyOrg(oId, myId);
  }

  let promise = loadUsers(orgId);

  // Refetch the user list upon org change
  $: {
    promise = loadUsers(orgId);
  }
</script>

{#await promise}
  <Loader active center pad />
{:then users}
  {#if users.length > 0}
    <p class="userCount">
      {$_("authSection.org.userCount", { values: { n: users.length } })}
    </p>
    <ul class="userList">
      {#each users as user}
        <li>
          <Link plusReplace={true} toUrl={userUrl(user)}>
            <div class="userListItem">
              {#if user.avatar_url}
                <img src={user.avatar_url} class="avatar" alt="" />
              {:else}
                <span class="icon"><Person16 /></span>
              {/if}
              <span class="name">{user.name}</span>
              {#if user.admin_organizations.includes(orgId)}
                <span class="badge">{$_("authSection.org.adminRole")}</span>
              {/if}
            </div>
          </Link>
        </li>
      {/each}
    </ul>
  {:else}
    <div class="empty">
      <div class="emptyIcon"><People24 /></div>
      <p>{$_("authSection.org.memberListEmpty")}</p>
    </div>
  {/if}
{:catch}
  <!-- Error state -->
  <div class="error">
    <div class="errorIcon"><Error /></div>
    <p>{$_("authSection.org.memberListError")}</p>
    <Button action on:click={loadUsers}>Retry</Button>
  </div>
{/await}

<style>
  .userCount {
    font-size: 0.875em;
    color: var(--gray);
    margin: 0.25rem 0.5rem;
  }
  .userList {
    list-style-type: none;
    padding: 0;
    margin: 0;
    max-height: 14rem;
    overflow-y: auto;
  }
  .userListItem {
    padding: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }
  .userListItem:hover {
    background: var(--light-primary);
  }
  .avatar,
  .icon {
    object-fit: cover;
    height: 1.5rem;
    width: 1.5rem;
    background: rgba(0, 0, 0, 0.1);
    /* border: 1px solid rgba(0, 0, 0, 0.05); */
    border-radius: 50%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .name {
    flex: 1 1 auto;
  }
  .badge {
    margin-left: 1em;
    font-size: 0.75em;
    text-transform: uppercase;
    letter-spacing: 0.1ch;
    color: var(--primary);
  }

  .error,
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    font-weight: 600;
    font-size: 0.875em;
  }

  .error {
    color: var(--caution);
  }

  .empty {
    fill: var(--gray);
    color: var(--gray);
  }

  .emptyIcon {
    transform: scale(2);
  }

  .errorIcon {
    text-align: center;
    height: 3em;
    width: 3em;
  }
</style>
