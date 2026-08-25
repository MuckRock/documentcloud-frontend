<script lang="ts" module>
  import { writable } from "svelte/store";
  import { projectDefaults } from "$lib/utils/embedConfig";

  export const embedSettings = writable(projectDefaults);
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import Settings from "$lib/components/common/Settings.svelte";

  import { projectSettings } from "$lib/utils/embedConfig";
  import { saveStore } from "$lib/utils/storage";

  // initialize and sync settings with localStorage
  onMount(() =>
    saveStore(embedSettings, "projectoptions", { storage: localStorage }),
  );
</script>

<Settings settings={projectSettings} values={embedSettings} />
