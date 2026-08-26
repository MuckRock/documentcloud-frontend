<script lang="ts" module>
  import { browser } from "$app/environment";
  import { writable } from "svelte/store";
  import { projectDefaults } from "$lib/utils/embedConfig";
  import { saveStore } from "$lib/utils/storage";

  export const embedSettings = writable(projectDefaults);

  if (browser) {
    saveStore(embedSettings, "projectoptions", { storage: localStorage });
  }
</script>

<script lang="ts">
  import Settings from "$lib/components/common/Settings.svelte";

  import { projectSettings } from "$lib/utils/embedConfig";
</script>

<Settings settings={projectSettings} values={embedSettings} />
