import Main from "./Main.svelte";

// Imports to get persistent app functionality working
import "./manager/orgsAndUsers.js";

const app = new Main({
  target: document.body,
});

window.app = app;

export default app;
