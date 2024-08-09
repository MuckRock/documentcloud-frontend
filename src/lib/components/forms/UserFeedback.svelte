<script lang="ts">
  import { Bug16, Comment16, Question16 } from "svelte-octicons";
  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";

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

  $: placeholder =
    feedbackTypes.find((type) => type.value === feedbackType)?.placeholder ??
    "My feedback is…";

  let status: null | "loading" | "success" | "error" = null;
  let statusText = "";

  function handleSubmit(e: SubmitEvent) {
    status = "loading";
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    // POST form data to baserow
    for (let [key, value] of fd.entries()) {
      console.log(key, value);
    }

    status = "success";
    statusText = "We have received your feedback. Thank you!";
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
  <textarea
    class="feedback"
    name="message"
    bind:value={feedback}
    {placeholder}
  />
  <footer class="actions">
    <Flex align="center">
      <Button type="submit" mode="primary" disabled={!feedback} />
    </Flex>
  </footer>
</form>

<style>
  header {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
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
    margin: 0.75rem 0;
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
  .feedbackType {
    display: flex;
    flex-wrap: wrap;
    margin: 0;
    gap: 0.5rem;
    border: 1px solid var(--gray-1);
    border-radius: 0.5rem;
    padding: 0.5rem;
  }
  .feedbackType label {
    flex: 1 0 auto;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    white-space: nowrap;
  }
  .feedbackType label:hover {
    background: var(--gray-1);
  }
  .feedbackType label.active {
    background: var(--blue-1);
  }
  .feedbackType input {
    display: none;
  }
</style>
