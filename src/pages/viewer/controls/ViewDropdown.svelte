<script>
  import { changeMode } from "@/viewer/renderer";

  let view = "document";

  $: {
    if (view == "text") {
      changeMode("text");
    } else {
      changeMode("image");
    }
  }
</script>

<select bind:value={view}>
  <option value="document">Document</option>
  <option value="text">Plain Text</option>
</select>
