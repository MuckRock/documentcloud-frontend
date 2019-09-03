<template>
  <div class="projects">
    <div class="titlesection">
      <Title :small="true">Projects</Title>
      <Button :small="true">+ New Project</Button>
    </div>
    <div class="projectcontainer">
      <Project v-for="project in sortedProjects" v-bind:key="project.id" v-bind:project="project" />
    </div>
  </div>
</template>

<style scoped>
.titlesection {
  padding: 0 25px;
}

.projects {
  padding: 0;
}

.projectcontainer {
  padding: 16px 0;
}
</style>

<script>
import Project from "./Project.vue";
import Title from "../common/Title";
import Button from "../common/Button";

export default {
  components: { Project, Title, Button },
  props: {
    projects: Array
  },
  computed: {
    sortedProjects() {
      return this.projects.slice().sort((a, b) => {
        return b.id - a.id;
      });
    }
  }
};
</script>