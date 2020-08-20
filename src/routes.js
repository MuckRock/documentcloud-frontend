import NotFound from "@/pages/NotFound";
import Empty from "@/pages/home/Empty";
import Home from "@/pages/home/Home";
import App from "@/pages/app/App";
import Viewer from "@/pages/viewer/Viewer";

// Embeds
import Note from "@/pages/embed/note/Note";
import Page from '@/pages/embed/page/Page';

export const routes = [
  NotFound,
  {
    default: {
      path: "/",
      component: Empty
    },
    home: {
      path: "/home",
      component: Home
    },
    app: {
      path: "/app",
      component: App
    },
    viewer: {
      path: "/documents/:id",
      component: Viewer
    },

    // Embeds
    note: {
      path: "/documents/:id/annotations/:noteId",
      component: Note,
    },
    page: {
      path: "/documents/:id/pages/:page",
      component: Page,
    }
  }
];
