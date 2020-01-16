import { Svue } from 'svue';
import { Project } from '@/structure/project';

export const projects = new Svue({
  data() {
    return {
      rawProjects: [],
    }
  },
  computed: {
    projects(rawProjects) {
      return rawProjects.map(project => new Project(project));
    }
  }
});
