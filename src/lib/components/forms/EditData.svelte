<script lang="ts">
  import type { ActionResult } from "@sveltejs/kit";
  import type { Document } from "$lib/api/types";

  import { invalidate } from "$app/navigation";

  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "$lib/components/common/Button.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import KeyValue, {
    type Result,
  } from "$lib/components/inputs/KeyValue.svelte";

  import { canonicalUrl } from "$lib/api/documents";
  import * as kv from "$lib/api/kv";
  import { getCsrfToken } from "$lib/utils/api";
  import { toast } from "../layouts/Toaster.svelte";

  interface Props {
    document: Document;
    onclose?: (() => void) | undefined;
  }

  let { document = $bindable(), onclose = undefined }: Props = $props();

  let csrf_token: string = $state("");
  let keys = $derived(Object.keys(document.data) ?? []);
  let tags = $derived(document.data["_tag"] ?? []);
  let data = $derived(
    Object.entries(document?.data)?.filter(([k, v]) => k !== "_tag") ?? [],
  );
  let action = $derived(new URL("?/data", canonicalUrl(document)).href);

  onMount(() => {
    csrf_token = getCsrfToken() ?? "";
  });

  async function add({ key, value }): Promise<Result> {
    if (!key || !value) {
      console.warn(`Missing values: ${{ key, value }}`);
      return {};
    }

    const { data } = await kv.update(
      document,
      key,
      [value],
      undefined,
      csrf_token,
    );

    if (data) {
      document = { ...document, data };
      await invalidate(`document:${document.id}`);
    }

    return {
      clear: true,
    };
  }

  async function onedit({ key, value }): Promise<Result> {
    if (!key || !value) {
      console.warn(`Missing values: ${{ key, value }}`);
      return {};
    }

    const { data } = await kv.update(
      document,
      key,
      [value],
      undefined,
      csrf_token,
    );

    if (data) {
      document = { ...document, data };
      await invalidate(`document:${document.id}`);
    }

    return { key, value };
  }

  async function remove({ key, value }): Promise<Result> {
    if (!(key in document.data)) {
      console.warn(`Unknown key: ${key}`);
      return {};
    }

    const { data } = await kv.update(document, key, [], [value], csrf_token);

    if (data) {
      document = { ...document, data };
      await invalidate(`document:${document.id}`);
    }

    return {};
  }

  function close() {
    onclose?.();
  }

  function onSubmit() {
    return async ({
      result,
      update,
    }: {
      result: ActionResult;
      update: (options?: Record<string, any>) => void;
    }) => {
      // `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
      close();
      update(result);
      if (result.type === "success") {
        // do something
        toast($_("edit.success"), { status: "success" });
      }
    };
  }
</script>

<form {action} method="post">
  <table>
    <thead>
      <tr>
        <th>
          {$_("data.key")}
        </th>
        <th>
          {$_("data.value")}
        </th>
      </tr>
    </thead>

    <!-- kv -->
    {#each data as [key, values]}
      {#each values as value}
        <KeyValue {keys} {key} {value} ondelete={remove} />
      {/each}
    {/each}

    {#each tags as tag}
      <KeyValue {keys} key="_tag" value={tag} ondelete={remove} {onedit} />
    {/each}
    <tfoot>
      <tr>
        <th>
          {$_("data.addNew")}
        </th>
      </tr>
      <KeyValue {keys} add onadd={add} />
    </tfoot>
  </table>
  <Flex class="buttons">
    <Button on:click={close}>{$_("dialog.done")}</Button>
  </Flex>
</form>

<style>
  table,
  thead,
  tfoot {
    width: 100%;
  }

  form {
    width: 100%;
    padding: 1rem;
  }

  th {
    text-align: start;
    font-size: var(--font-md);
    font-weight: var(--font-semibold);
  }

  th {
    padding: 0.5rem 0.5rem 0.5rem 0;
  }
</style>
