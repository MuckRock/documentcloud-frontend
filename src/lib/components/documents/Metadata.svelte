<!--
  @component
  Document metadata:

  - contributor
  - created date
  - last updated date
  - text language
-->
<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { _ } from "svelte-i18n";

  import { LANGUAGE_MAP } from "@/config/config.js";
  import { userOrgString } from "$lib/api/documents";
  import Metadata from "../common/Metadata.svelte";

  export let document: Document;

  function dateFormat(date: Date | string) {
    return new Date(date).toLocaleDateString();
  }
</script>

<div class="meta">
  <Metadata key={$_("sidebar.contributed")}>
    {userOrgString(document)}
  </Metadata>
  <Metadata key={$_("sidebar.created")}>
    {dateFormat(document.created_at)}
  </Metadata>
  <Metadata key={$_("sidebar.updated")}>
    {dateFormat(document.updated_at)}
  </Metadata>
  <Metadata key={$_("sidebar.language")}>
    {LANGUAGE_MAP.get(document.language)}
  </Metadata>
</div>

<style>
  .meta {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0 0.5rem;
  }
</style>
