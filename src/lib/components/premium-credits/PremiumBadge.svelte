<script lang="ts">
  import { _ } from "svelte-i18n";
  import Badge from "$lib/components/common/Badge.svelte";
  import Premium from "$lib/components/icons/Premium.svelte";
</script>

<Badge
  label={$_("premium.badge")}
  badgeColor="transparent"
  labelColor="var(--premium)"
>
  <Premium slot="icon" />
</Badge>
