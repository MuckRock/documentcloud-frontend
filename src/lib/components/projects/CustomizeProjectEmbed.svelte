<script lang="ts" module>
  import { writable } from "svelte/store";
  import { settings } from "$lib/utils/projectEmbed";

  export const embedSettings = writable(settings);
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import Settings from "$lib/components/common/Settings.svelte";

  import { loadSettings } from "$lib/utils/embed";
  import { settingsConfig } from "$lib/utils/projectEmbed";
  import { StorageManager } from "$lib/utils/storage";

  interface Props {
    storageManager?: any;
  }

  let { storageManager = new StorageManager("projectembed") }: Props = $props();

  // initialize settings with loaded values
  onMount(() => loadSettings(storageManager, settingsConfig, embedSettings));
</script>

<Settings settings={settingsConfig} values={embedSettings} />
