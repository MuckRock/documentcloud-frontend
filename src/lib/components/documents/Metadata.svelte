<script lang="ts">
  import { _ } from "svelte-i18n";

  import { LANGUAGE_MAP } from "@/config/config.js";
  import { userOrgString } from "$lib/api/documents";
  import type { Document } from "$lib/api/types";
  import Metadata from "../common/Metadata.svelte";

  export let document: Document;

  function dateFormat(date: Date | string) {
    return new Date(date).toLocaleDateString();
  }
</script>

<!--
  @component
  Document metadata:

  - contributor
  - created date
  - last updated date
  - text language
-->
<div class="meta">
  <Metadata key={$_("sidebar.contributed")} value={userOrgString(document)} />
  <Metadata
    key={$_("sidebar.created")}
    value={dateFormat(document.created_at)}
  />
  <Metadata
    key={$_("sidebar.updated")}
    value={dateFormat(document.updated_at)}
  />
  <Metadata
    key={$_("sidebar.language")}
    value={LANGUAGE_MAP.get(document.language)}
  />
</div>

<style>
  .meta {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
