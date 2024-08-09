<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Bug16, Comment16, Question16 } from "svelte-octicons";
  import type { User } from "@/api/types";
  import { createFeedback, type Feedback } from "@/lib/api/feedback";
  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import UserAvatar from "../accounts/UserAvatar.svelte";
  import { toast } from "../layouts/Toaster.svelte";

  export let user: User = undefined;

  let feedback = "";
  let feedbackType = "Comment";

  let feedbackTypes = [
    {
      id: "comment",
      value: "Comment",
      label: "Send a Comment",
      placeholder: "I think that…",
      icon: Comment16,
    },
    {
      id: "bug",
      value: "Bug",
      label: "Report a Bug",
      placeholder: "I want to…",
      icon: Bug16,
    },
    {
      id: "question",
      value: "Question",
      label: "Ask a Question",
      placeholder: "How can I…",
      icon: Question16,
    },
  ];

  let anonymous = !Boolean(user);

  const dispatch = createEventDispatcher();
  $: placeholder =
    feedbackTypes.find((type) => type.value === feedbackType)?.placeholder ??
    "My feedback is…";

  let status: null | "loading" | "success" | "error" = null;

  // For simplicity, we directly call the Baserow API from the client.
  // Unfortunately, this exposes our API token and endpoint to end users.
  // If we want a more secure approach, we can provide the submission logic
  // in SvelteKit server logic, though that approach is more complex.
  async function handleSubmit(e: SubmitEvent) {
    status = "loading";
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    // POST form data to baserow
    const data: Feedback = {
      Type: String(fd.get("type")) ?? "",
      Message: String(fd.get("message")) ?? "",
      User: String(fd.get("user")) ?? "",
    };
    try {
      await createFeedback(data);
      status = "success";
      toast("We have received your feedback. Thank you!", {
        status: "success",
      });
      dispatch("close");
    } catch (e) {
      toast(String(e), { status: "error" });
      status = "error";
    }
  }
</script>

<!-- TODO: I18N -->

<form class="userFeedback" on:submit|preventDefault={handleSubmit}>
  <header>
    <h1>Share Your Feedback</h1>
    <div class="hello-message">
      <p>
        Thanks for trying out the public preview for the next major version of
        DocumentCloud! We are still hard at work adding features, fixing bugs,
        and improving the experience. We welcome your feedback&mdash;comments,
        ideas, and questions&mdash;to inform our progress. We are a very small
        team so we cannot guarantee that we will respond to all feedback, but we
        will read and review all of it.
      </p>
    </div>
  </header>
  <fieldset class="feedbackType">
    {#each feedbackTypes as type (type.id)}
      <label class:active={feedbackType === type.value} class={type.id}>
        <input
          type="radio"
          name="type"
          value={type.value}
          bind:group={feedbackType}
        />
        <svelte:component this={type.icon} />
        {type.label}
      </label>
    {/each}
  </fieldset>
  {#if user}
    <fieldset class="userIdentity">
      <legend>Sharing feedback as:</legend>
      {#if anonymous}
        <Flex align="center">
          <UserAvatar />
          <span class="name">Anonymous</span>
          <input type="hidden" name="user" value={null} />
        </Flex>
      {:else}
        <Flex align="center">
          <UserAvatar {user} />
          <span class="name">{user.name ?? user.username}</span>
          <input type="hidden" name="user" value={user.email} />
        </Flex>
      {/if}
      <label class="anonymous">
        <input type="checkbox" bind:checked={anonymous} />
        Share anonymously
      </label>
    </fieldset>
  {/if}
  <textarea
    class="feedback"
    name="message"
    bind:value={feedback}
    {placeholder}
  />

  <footer class="actions">
    <Flex align="center">
      <Button
        type="submit"
        mode="primary"
        disabled={!feedback || status === "loading"}
      />
    </Flex>
  </footer>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  header,
  footer {
    padding: 0.5rem;
  }
  h1 {
    margin-bottom: 0.5rem;
  }
  .hello-message {
    font-size: var(--font-sm);
    color: var(--gray-4);
    line-height: 1.6;
  }
  .feedback {
    margin: 0;
    padding: 0.75rem;
    min-height: 5rem;
    width: 100%;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-3, hwb(205 60% 30%));
    background: var(--white, #fff);
    box-shadow: 0px 2px 0px 0px var(--gray-2, #d8dee2) inset;
    resize: vertical;
    font-family: var(--font-family, var(--font-mono, "Source Code Pro"));
    font-size: var(--font-size, var(--font-sm, 0.875rem));
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
  fieldset {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: 0;
    gap: 0.5rem;
    border: 1px solid var(--gray-1);
    border-radius: 1rem;
    padding: 0.5rem;
  }
  fieldset legend {
    padding: 0 0.5rem;
    font-size: var(--font-xs);
    font-weight: var(--font-semibold);
  }
  .feedbackType label {
    flex: 1 0 auto;
    padding: 0.5rem 1rem;
    border: 2px solid transparent;
    border-radius: 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    white-space: nowrap;
    font-weight: var(--font-semibold);

    fill: var(--gray-4);
    color: var(--gray-5);

    transition: all 0.1s linear;
  }
  .feedbackType label:hover {
    background: var(--gray-1);
  }
  .feedbackType label.active {
    fill: var(--blue-4);
    color: var(--blue-5);
    border-color: var(--blue-3);
    background: var(--blue-1);
  }
  .feedbackType input {
    display: none;
  }
  .userIdentity {
    padding: 0.5rem 1rem;
  }
</style>
