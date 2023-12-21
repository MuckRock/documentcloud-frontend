<script lang="ts">
  import { _ } from "svelte-i18n";
  import Badge from "../common/Badge.svelte";
  import Credit from "../common/icons/Credit.svelte";
  import Premium from "../common/icons/Premium.svelte";
</script>

<Badge
  label={$_("premium.badge")}
  badgeColor="transparent"
  labelColor="var(--premium)"
>
  <Premium slot="icon" />
</Badge>
