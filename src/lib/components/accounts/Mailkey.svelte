<script lang="ts">
  import {_} from 'svelte-i18n';
  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Modal from "../layouts/Modal.svelte";
  import { createMailkey, destroyMailkey } from '$lib/api/accounts';

  export let fetch = globalThis.fetch;
  export let message: string = '';
  let error = false;

  function reset() {
    message = '';
    error = false;
  }

  async function create() {
    reset();
    const mailkey = await createMailkey(fetch);
    if (mailkey) {
      message = $_("mailkey.create.success", {
        values: { mailkey: mailkey },
      });
    } else {
      error = true;
      message = $_("mailkey.create.failure")
    }
  }

  async function destroy() {
    reset();
    if (await destroyMailkey(fetch)) {
      message = $_("mailkey.destroy.success");
    } else {
      error = true;
      message = $_("mailkey.destroy.failure");
    }
  }
</script>

<Modal on:close>
  <h1 slot="title">{$_("mailkey.title")}</h1>
  <div class="description">{@html $_("mailkey.description")}</div>
  {#if message}
    <p class:error>
      {@html message}
    </p>
  {/if}
  <Flex gap={1} wrap justify="center">
    <Button mode="primary" on:click={create}>{$_("mailkey.create.button")}</Button>
    <Button mode="danger" on:click={destroy}>{$_("mailkey.destroy.button")}</Button>
  </Flex>
</Modal>

<style>
  .description {
    columns: 2;
    column-gap: 2rem;
    margin-bottom: 1rem;
    font-size: var(--font-sm);
  }
  :global(.description p) {
    margin-bottom: 1rem;
    -webkit-column-break-inside: avoid;
  }
  .error {
    color: var(--red-3);
  }
  @media (max-width: 42rem) {
    .description {
      columns: 1;
    }
  }
</style>