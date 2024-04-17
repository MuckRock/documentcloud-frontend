<script lang="ts">
  import type { Org } from "@/api/types";
  import { ChevronDown16 } from "svelte-octicons";

  export let org: Org;
</script>

<div class="container">
  <div class="org">
    <div class="avatar">
      <img alt="MuckRock's avatar" src={org.avatar_url} />
    </div>
    <p class="name">{org.name}</p>
    <span class="arrow"><ChevronDown16 /></span>
  </div>
</div>

<style>
  .container {
    width: 100%;
    display: flex;
    gap: 0.5rem;
    flex: 1 0 0;
  }
  .org {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex: 1 0 0;
  }
  .avatar {
    width: 1.5rem;
    height: 1.5rem;

    overflow: hidden;
    border-radius: 0.75rem;
    background: var(--gray-2, #d8dee2);
  }
  .avatar img {
    display: block;
    height: 100%;
    width: 100%;
  }
  .name {
    color: #233944;
    font-family: var(--font-sans, "Source Sans Pro");
    font-weight: var(--font-semibold, 600);
    line-height: 1rem;
  }
  .arrow {
    width: 1rem;
    height: 1rem;
    fill: #5c717c;
  }

  /* unused
  .premium {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 0 0 0;
    align-self: stretch;
    fill: var(--premium);
    height: 2rem;
    width: 2rem;
  } 
  */

  @media (max-width: 64rem) {
    .name {
      display: none;
    }
  }
</style>
