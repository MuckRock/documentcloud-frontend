<script lang="ts">
  import type { User, Org, Maybe } from "$lib/api/types";
  import { Person16, Organization16 } from "svelte-octicons";

  interface Props {
    user?: Maybe<User>;
    org?: Maybe<Org>;
  }

  let { user = undefined, org = undefined }: Props = $props();
</script>

<div class="avatar">
  {#if user}
    {#if user.avatar_url}
      <img src={user.avatar_url} alt="Avatar" />
    {:else}
      <Person16 fill="var(--gray-4)" />
    {/if}
  {:else if org}
    {#if org.avatar_url}
      <img src={org.avatar_url} alt="Avatar" />
    {:else}
      <Organization16 fill="var(--gray-4)" />
    {/if}
  {/if}
</div>

<style>
  .avatar {
    height: 1.5rem;
    width: 1.5rem;
    border-radius: 0.75rem;
    background: var(--gray-2);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .avatar > img {
    height: 100%;
    width: 100%;
  }
</style>
