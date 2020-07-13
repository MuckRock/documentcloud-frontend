<script>
  import { layout } from "@/viewer/layout";
  import { doc, changeMode } from "@/viewer/document";

  let value = doc.mode;

  $: {
    handleMode(value);
  }

  async function handleMode(mode) {
    if (mode == "text") {
      await changeMode("text");
    } else if (mode == "image") {
      await changeMode("image");
    }
  }

  async function handleChange(e) {
    const view = e.target.value;
    await handleMode(view);
  }
</script>

<select bind:value on:blur={handleChange}>
  <option value="image">Document</option>
  <option value="text">Plain Text</option>
  <option value="search" hidden={$layout.searchPages == null}>
    Search Results
  </option>
</select>
