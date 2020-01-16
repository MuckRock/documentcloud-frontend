import Main from './Main.svelte';

const app = new Main({
  target: document.body,
});

window.app = app;

export default app;
