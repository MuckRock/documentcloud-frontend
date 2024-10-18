<script lang="ts">
  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import { me } from "../fixtures/accounts";
  import { getCurrentUser } from "@/lib/utils/permissions";

  const mockUser = writable(me);
  setContext("me", mockUser);

  const user = getCurrentUser();
</script>

<p>{$user.name}</p>
