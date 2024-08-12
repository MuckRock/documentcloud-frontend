<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { enhance } from "$app/forms";
  import { _ } from "svelte-i18n";
  import { Bug16, Comment16, Question16 } from "svelte-octicons";
  import type { User } from "@/api/types";
  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import UserAvatar from "../accounts/UserAvatar.svelte";
  import { toast } from "../layouts/Toaster.svelte";
  import { APP_URL } from "@/config/config";

  export let user: User = undefined;

  let feedback = "";
  let feedbackType = "Comment";

  let feedbackTypes = [
    {
      id: "comment",
      value: "Comment",
      label: $_("feedback.types.comment.label"),
      placeholder: $_("feedback.types.comment.placeholder"),
      icon: Comment16,
    },
    {
      id: "bug",
      value: "Bug",
      label: $_("feedback.types.bug.label"),
      placeholder: $_("feedback.types.bug.placeholder"),
      icon: Bug16,
    },
    {
      id: "question",
      value: "Question",
      label: $_("feedback.types.question.label"),
      placeholder: $_("feedback.types.question.placeholder"),
      icon: Question16,
    },
  ];

  let anonymous = !Boolean(user);

  const dispatch = createEventDispatcher();
  $: placeholder =
    feedbackTypes.find((type) => type.value === feedbackType)?.placeholder ??
    $_("feedback.defaultPlaceholder");

  let status: null | "loading" | "success" | "error" = null;

  function handleSubmit() {
    status = "loading";
    return async ({ result }) => {
      if (result.success) {
        status = "success";
        toast($_("feedback.success"), {
          status: "success",
        });
        dispatch("close");
      } else if (result.failure) {
        status = "error";
        toast(result.error, { status: "error" });
      }
    };
  }
</script>

<form
  class="userFeedback"
  method="POST"
  action="{APP_URL}?/feedback"
  use:enhance={handleSubmit}
>
  <header>
    <div class="hello-message">
      {@html $_("feedback.hello")}
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
      <legend>{$_("feedback.userIdentity.legend")}</legend>
      {#if anonymous}
        <Flex align="center">
          <UserAvatar />
          <span class="name">{$_("feedback.userIdentity.anonymous")}</span>
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
        {$_("feedback.userIdentity.shareAnonymously")}
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
  .hello-message {
    font-size: var(--font-sm);
    color: var(--gray-5);
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
