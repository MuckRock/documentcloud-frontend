import Main from './Main.svelte';

// Imports to get persistent app functionality working
import '@/manager/orgsAndUsers';
import '@/manager/documents';
import '@/manager/layout';
import '@/search/search';
import '@/viewer/document';
import '@/viewer/viewer';
import '@/viewer/layout';

const app = new Main({
  target: document.body,
});

window.app = app;

export default app;
