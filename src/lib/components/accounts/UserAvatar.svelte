<script lang="ts">
  import type { User } from "@/api/types";
  import { Person16 } from "svelte-octicons";

  export let user: User = undefined;
</script>

<div class="avatar">
  {#if user?.avatar_url}
    <img src={user.avatar_url} alt="Avatar" />
  {:else}
    <Person16 fill="var(--gray-4)" />
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
