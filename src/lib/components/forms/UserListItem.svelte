<!-- Source: https://github.com/MuckRock/squarelet/blob/master/frontend/components/UserListItem.svelte -->

<script lang="ts">
  import type { SquareletUser } from "$lib/api/types";

  let { user }: { user: SquareletUser } = $props();
</script>

<div class="user-list-item">
  {#if user.avatar_url}
    <img
      src={user.avatar_url}
      alt={user.name || user.username}
      class="avatar"
    />
  {/if}
  <div class="info">
    <span class="name">{user.name || user.username}</span>
    {#if user.name}
      <span class="username">{user.username}</span>
    {/if}
  </div>
</div>

<style>
  .user-list-item {
    display: flex;
    height: 1.5625rem;
    align-items: center;
    gap: 0.5rem;
    align-self: stretch;
    border-radius: 0.25rem;
  }

  .avatar {
    display: flex;
    width: 1.5625rem;
    height: 1.5625rem;
    padding: 0.15625rem;
    justify-content: center;
    align-items: center;
    aspect-ratio: 1/1;

    border-radius: 1.5625rem;
    border: 1px solid var(--gray-2, #d8dee2);
    background: var(--gray-1, #f5f6f7);
  }

  .info {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;

    .name {
      color: var(--gray-5, #233944);
      font-family: var(--font-sans, "Source Sans Pro");
      font-size: var(--font-md, 1rem);
      font-style: normal;
      font-weight: 600;
      line-height: 1.5rem; /* 150% */
    }

    .username {
      color: var(--gray-5, #233944);
      font-family: var(--font-sans, "Source Sans Pro");
      font-size: var(--font-xs, 0.75rem);
      font-style: normal;
      font-weight: 400;
      line-height: 1rem; /* 133.333% */
    }
  }
</style>
