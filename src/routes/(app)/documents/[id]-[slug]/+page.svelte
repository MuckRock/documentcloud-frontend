<!-- @component
  Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
  import { _ } from "svelte-i18n";

  import DocumentLayout from "$lib/components/layouts/DocumentLayout.svelte";
  import GuidedTour from "$lib/components/onboarding/GuidedTour.svelte";

  export let data;

  $: action = data.action;
  $: addons = data.pinnedAddons;
</script>

<DocumentLayout {action} {addons} />
<GuidedTour />
