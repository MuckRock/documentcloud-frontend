<script lang="ts">
  import Badge from "../Badge.svelte";
  import Star from "../icons/Star.svelte";

  export let label = "Badge";
  export let badgeColor = undefined;
  export let labelColor = undefined;
</script>

<Badge {label} {badgeColor} {labelColor}>
  <Star slot="icon" />
</Badge>
