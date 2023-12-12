<script lang="ts">
  import { _ } from "svelte-i18n";
  import Badge from "../common/Badge.svelte";
  import Credit from "../common/icons/Credit.svelte";
</script>

<Badge
  label={$_("premium.badge")}
  badgeColor="var(--premium)"
  labelColor="var(--darkgray)"
>
  <Credit badge slot="icon" color="var(--darkgray)" />
</Badge>
