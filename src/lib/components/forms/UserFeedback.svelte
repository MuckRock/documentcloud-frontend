<script lang="ts">
  import type { Nullable, User } from "$lib/api/types";

  import { untrack } from "svelte";

  import { enhance } from "$app/forms";
  import { page } from "$app/state";

  import { _ } from "svelte-i18n";
  import { Alert24, Bug16, Comment16, Question16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Tip from "../common/Tip.svelte";
  import Field from "../inputs/Field.svelte";
  import Text from "../inputs/Text.svelte";

  import { APP_URL } from "@/config/config";
  import { getUserName } from "$lib/api/accounts";

  let feedback = $state("");
  interface Props {
    user?: Nullable<User>;
    feedbackType?: string;
    onclose?: () => void;
  }

  let {
    user = null,
    feedbackType = $bindable("Comment"),
    onclose,
  }: Props = $props();

  // Zendesk needs an address to open a ticket, so we ask for one and
  // pre-fill it for signed-in users
  let email = $state(untrack(() => user?.email) ?? "");

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

  let placeholder = $derived(
    feedbackTypes.find((type) => type.value === feedbackType)?.placeholder ??
      $_("feedback.defaultPlaceholder"),
  );

  let status: null | "loading" | "success" | "error" = $state(null);
  let error: string | null = $state(null);

  function handleSubmit() {
    status = "loading";
    error = null;
    // update() applies the action result and invalidates, which is what lets
    // the server's flash message reach the toaster
    return async ({ result, update }) => {
      if (result.type === "success") {
        status = "success";
        await update();
        onclose?.();
      } else if (result.type === "failure") {
        status = "error";
        error = result.data?.message ?? $_("feedback.error");
        // keep what they wrote so they can retry
        await update({ reset: false });
      } else if (result.type === "error") {
        status = "error";
        error = $_("feedback.error");
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
        <type.icon />
        {type.label}
      </label>
    {/each}
  </fieldset>
  <fieldset class="userIdentity">
    <legend>{$_("feedback.userIdentity.legend")}</legend>
    <Field
      title={$_("feedback.userIdentity.email")}
      description={$_("feedback.userIdentity.emailHelp")}
      sronly
    >
      <Text
        type="email"
        name="email"
        autocomplete="email"
        placeholder={$_("feedback.userIdentity.emailPlaceholder")}
        bind:value={email}
        required
      />
    </Field>
    {#if user}
      <input type="hidden" name="name" value={getUserName(user)} />
    {/if}
  </fieldset>
  <input type="text" name="url" value={page.url.href} hidden />
  <textarea class="feedback" name="message" bind:value={feedback} {placeholder}
  ></textarea>

  {#if error}
    <Tip mode="error">
      {#snippet icon()}<Alert24 />{/snippet}
      <p>{error}</p>
    </Tip>
  {/if}

  <footer class="actions">
    <Flex align="center">
      <Button
        type="submit"
        mode="primary"
        disabled={!feedback || !email || status === "loading"}
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
    padding: 0.5rem 0;
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
    display: block;
    padding: 0.5rem;
  }
  .userIdentity :global(.help) {
    margin: 0.5rem 0.5rem 0;
  }
</style>
