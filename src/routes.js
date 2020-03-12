import NotFound from "@/pages/NotFound";
import Empty from "@/pages/home/Empty";
import Home from "@/pages/home/Home";
import App from "@/pages/app/App";
import Viewer from "@/pages/viewer/Viewer";

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
    }
  }
];
