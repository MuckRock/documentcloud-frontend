<script lang="ts">
  import Projects from "./Projects.svelte";
  import { projects } from "../../../manager/projects.js";
  import { newProject } from "../../../manager/layout.js";
</script>

<Projects {projects} {newProject} />
