<script>
  import { handlePlural } from "@/util/string";
  import { Svue } from "svue";

  export let project;

  $: docs = handlePlural(project.documentCount, "Document", true);
  // Hide text for notes and collaborators if empty
  $: notes = handlePlural(project.annotationCount, "Note");
  $: collaborators = handlePlural(project.collaboratorCount, "Collaborator");

  $: infoString = [docs, notes, collaborators]
    .filter(x => x.length > 0)
    .join(", ");
</script>

<style lang="scss">
  .project {
    padding: 11px 25px;

    &:hover {
      cursor: pointer;
      background: rgba(0, 0, 0, 0.03);
      opacity: $hover-opacity;
    }
  }

  .title {
    font-size: $normal;
  }

  .sub {
    font-size: $small;
    line-height: 15px;
    color: $gray;
  }
</style>

<div class="project">
  <div class="title">{project.title}</div>
  <div v-if="ownProject" class="sub">Shared by {project.accountName}</div>
  <div class="sub">{infoString}</div>
</div>
