<template>
  <div class="project">
    <div class="title">{{ project.title }}</div>
    <div v-if="ownProject" class="sub">Shared by {{ project.account_full_name }}</div>
    <div class="sub">{{ infoString }}</div>
  </div>
</template>

<style scoped>
.project {
  padding: 11px 25px;
}

.project:hover {
  cursor: pointer;
  background: rgba(0, 0, 0, 0.03);
  opacity: var(--hover-opacity);
}

.title {
  font-size: var(--normal);
}

.sub {
  font-size: var(--small);
  line-height: 15px;
  color: var(--gray);
}
</style>

<script>
function wrapString(value, str, allowZero = false) {
  if (!allowZero && value == 0) return "";
  if (value == 1) return `1 ${str}`;
  return `${value} ${str}s`;
}

export default {
  props: {
    project: Object
  },
  computed: {
    collaboratorCount() {
      return this.project.collaborators.length;
    },
    ownProject() {
      return this.collaboratorCount > 0;
    },
    docsString() {
      return wrapString(this.project.document_count, "Document", true);
    },
    notesString() {
      return wrapString(this.project.annotation_count, "Note");
    },
    collaboratorString() {
      return wrapString(this.collaboratorCount, "Collaborator");
    },
    infoString() {
      const infoBits = [
        this.docsString,
        this.notesString,
        this.collaboratorString
      ].filter(x => x.length > 0);
      return infoBits.join(", ");
    }
  }
};
</script>