<script>
  import { renderer, changeMode } from "@/viewer/renderer";
  import { layout } from "@/viewer/layout";

  async function handleChange(e) {
    const view = e.target.value;
    console.log("GOT VIEW", view);
    if (view == "text") {
      await changeMode("text");
    } else if (view == "image") {
      await changeMode("image");
    }
  }
</script>

<select bind:value={$renderer.mode} on:change={handleChange}>
  <option value="image">Document</option>
  <option value="text">Plain Text</option>
  <option value="search" hidden={$layout.searchPages == null}>
    Search Results
  </option>
</select>
