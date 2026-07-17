<script lang="ts">
  import type { StoryContext } from "@storybook/sveltekit";
  import type { Maybe, User } from "$lib/api/types";

  import { type Snippet, setContext } from "svelte";
  import { type Writable, writable } from "svelte/store";
  import { me } from "@/test/fixtures/accounts";

  interface Props {
    // Accept the story context as a prop
    context?: StoryContext | undefined;
    children?: Snippet;
  }

  let { context = undefined, children }: Props = $props();

  const userStore: Writable<Maybe<User>> = writable(undefined);

  // Check if the story has signedOut parameter
  let isSignedOut = $derived(context?.parameters?.signedOut ?? false);
  $effect(() => {
    userStore.set(isSignedOut ? undefined : me);
  });

  setContext("me", userStore);
</script>

{@render children?.()}
