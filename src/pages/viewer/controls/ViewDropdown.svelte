<script>
  import { layout } from "@/viewer/layout";

  // TODO: get this working

  async function handleChange(e) {
    // const view = e.target.value;
    // if (view == "text") {
    //   await changeMode("text");
    // } else if (view == "image") {
    //   await changeMode("image");
    // }
  }
</script>

<select on:blur={handleChange}>
  <option value="image">Document</option>
  <option value="text">Plain Text</option>
  <option value="search" hidden={$layout.searchPages == null}>
    Search Results
  </option>
</select>

<!-- <select bind:value={$renderer.mode} on:blur={handleChange}>
  <option value="image">Document</option>
  <option value="text">Plain Text</option>
  <option value="search" hidden={$layout.searchPages == null}>
    Search Results
  </option>
</select> -->
