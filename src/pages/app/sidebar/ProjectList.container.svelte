<script lang="ts">
  import Projects from "./ProjectList.svelte";
  import { projects } from "../../../manager/projects.js";
  import { newProject, editProject } from "../../../manager/layout.js";
</script>

<Projects {projects} {newProject} {editProject} />
