<script>
  import { _ } from "svelte-i18n";

  // Components
  import Progress from "@/common/Progress";
  import Button from "@/common/Button";

  // Store properties
  import { removeRun, done, editAddonRun } from "@/manager/addons";

  import { dismissAddonRun } from "@/api/addon";

  export let run;
  export let compact = false;
  let comment = "";
  let cancelled = [];

  function getStatus(status) {
    if (status === "cancelled") {
      return "Timed Out"
    }
    return status
      .split("_")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  }

  function dismiss(uuid) {
    removeRun(uuid);
    dismissAddonRun(uuid);
  }

  function cancel(uuid) {
    cancelAddonRun(uuid);
    cancelled.push(uuid);
  }

  function thumbsUp() {
    rate(1);
  }

  function thumbsDown() {
    rate(-1);
  }

  function rate(val) {
    const newVal = run.rating === val ? 0 : val;
    editAddonRun(run, {rating: newVal});
  }

  function submitFeedback() {
    editAddonRun(run, {comment});
  }

</script>

<style lang="scss">
  .dismiss {
    margin: 0 1px 0 14px;
  }

  .valign,
  .dismiss {
    display: inline-block;
    vertical-align: middle;
  }

  .info {
    @include processingText;

    font-weight: bold;
    display: inline-block;
    vertical-align: middle;
    padding-right: 20px;
    width: 20%;
  }

  .info.compact {
    width: 100%;
    padding-right: 0;
  }

  .message {
    display: block;
    width: 100%;
  }

  .addonRun {
    padding: 8px 20px;
    border-top: 1px solid rgba(128, 128, 128, 0.15);
  }

  .failure, .cancelled {
    background: $errorbg;
    .info {
      color: $caution;
    }
  }

  .rate {
    display: inline-block;
    vertical-align: top;
  }

  a {
    text-decoration: underline;
    &:hover {
      filter: brightness(85%);
    }
  }
</style>

<div class="addonRun {run.status}">
  <div class="info" class:compact>
    {#if compact}
      {run.createdAt.toLocaleString()}
    {:else}
      {run.addonName}
    {/if}
    - {getStatus(run.status)}
  </div>
  {#if !compact}
    <Progress
      progress={done(run) ? 1 : run.progress / 100}
      initializing={run.progress == 0 && !done(run)}
      compact={run.progress == 0 && !done(run)}
      failure={run.failure}
    />
    <span class="dismiss">
      <Button
        small={true}
        on:click={() => dismiss(run.uuid)}
        danger={run.failure}
      >
        {$_("dialog.dismiss")}
      </Button>
    </span>
    {#if done(run)}
      <span class="rate">
        <Button
          small={true}
          on:click={thumbsUp}
          secondary={run.rating !== 1}
          >
          &#x1F44D;
        </Button>
        <Button
          small={true}
          on:click={thumbsDown}
          secondary={run.rating !== -1}
          >&#x1F44E;
        </Button>

        {#if run.rating !== 0}
          <span class="info message comment" class:compact>
            {#if run.comment === ""}
              <input
                placeholder="Feedback on this AddOn Run"
                maxlength="255"
                bind:value={comment}
                >
              <Button small={true} on:click={submitFeedback}>Submit</Button>
            {:else}
              <span>Thanks for the feedback!</span>
            {/if}
          </span>
        {/if}
      </span>
    {:else} 
      <span class="cancel">
        {#if cancelled.includes(run.uuid)}
          <Button
            small={true}
            danger={true}
            disabled={true}
            >
            {$_("dialog.cancelling")}
          </Button>
        {:else}
          <Button
            small={true}
            on:click={() => cancel(run.uuid)}
            danger={true}
            >
            {$_("dialog.cancel")}
          </Button>
        {/if}
      </span>
    {/if}
  {/if}
  {#if run.message || run.fileUrl}
    <div class="info message" class:compact>
      {#if run.message}{run.message}{/if}
      {#if run.message && run.fileUrl} - {/if}
      {#if run.fileUrl}<a href={run.fileUrl}>Download File</a>{/if}
    </div>
  {/if}
</div>
