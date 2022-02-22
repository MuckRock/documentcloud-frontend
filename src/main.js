console.log("process:",process.env)
import Main from "./Main.svelte";

// Imports to get persistent app functionality working
import "@/manager/orgsAndUsers";

const app = new Main({
  target: document.body,
});

window.app = app;

export default app;
