<script lang="ts" module>
  import { browser } from "$app/environment";
  import { writable } from "svelte/store";
  import { documentDefaults } from "$lib/utils/embedConfig";
  import { saveStore } from "$lib/utils/storage";

  export const embedSettings = writable(documentDefaults);

  if (browser) {
    saveStore(embedSettings, "vieweroptions", { storage: localStorage });
  }
</script>

<script lang="ts">
  import Settings from "$lib/components/common/Settings.svelte";

  import { documentSettings } from "$lib/utils/embedConfig";
</script>

<Settings settings={documentSettings} values={embedSettings} />
