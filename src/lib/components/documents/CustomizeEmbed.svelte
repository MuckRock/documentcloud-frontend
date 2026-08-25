<script lang="ts" module>
  import { writable } from "svelte/store";
  import { documentDefaults } from "$lib/utils/embedConfig";

  export const embedSettings = writable(documentDefaults);
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import Settings from "$lib/components/common/Settings.svelte";

  import { documentSettings } from "$lib/utils/embedConfig";
  import { saveStore } from "$lib/utils/storage";

  // initialize and sync settings with localStorage
  onMount(() =>
    saveStore(embedSettings, "vieweroptions", { storage: localStorage }),
  );
</script>

<Settings settings={documentSettings} values={embedSettings} />
