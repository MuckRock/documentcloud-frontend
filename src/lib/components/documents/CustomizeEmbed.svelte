<script lang="ts" module>
  import { writable } from "svelte/store";
  import { settings } from "$lib/utils/embed";

  export const embedSettings = writable(settings);
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import Settings from "$lib/components/common/Settings.svelte";

  import { settingsConfig, loadSettings } from "$lib/utils/embed";
  import { StorageManager } from "$lib/utils/storage";

  // The embed customization allows a user to control settings
  // that customize the presentation of a document embed. The user's
  // preferences should be saved to localStorage for future embeds.
  interface Props {
    storageManager?: any;
  }

  let { storageManager = new StorageManager("vieweroptions") }: Props =
    $props();

  // initialize settings with loaded values
  onMount(() => loadSettings(storageManager, settingsConfig, embedSettings));
</script>

<Settings settings={settingsConfig} values={embedSettings} />
