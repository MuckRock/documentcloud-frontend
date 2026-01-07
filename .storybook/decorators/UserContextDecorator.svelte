<script lang="ts">
  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import type { StoryContext } from "@storybook/svelte";
  import type { User } from "@/api/types";
  import { me } from "@/test/fixtures/accounts";

  // Accept the story context as a prop
  export let context: StoryContext | undefined = undefined;

  const userStore: Writable<User> = writable(null);

  // Check if the story has signedOut parameter
  $: isSignedOut = context?.parameters?.signedOut ?? false;
  $: userStore.set(isSignedOut ? null : (me as User));

  setContext("me", userStore);
</script>

<slot />
