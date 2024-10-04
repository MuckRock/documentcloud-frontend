import type { DriveStep } from "driver.js";

export const scripts: Record<string, DriveStep[]> = {
  "/documents": [
    {
      popover: {
        title: "Welcome to the new DocumentCloud",
        description:
          "We've rebuilt DocumentCloud to be faster and easier to use than ever. Let's take a look around!",
        align: "center",
      },
    },
    {
      element: "#navigation",
      popover: {
        title: "Find your way",
        description:
          "The navigation sidebar contains quick links for searching documents, and more.",
        align: "center",
      },
    },
    {
      element: "#projects",
      popover: {
        title: "Stay organized with Projects",
        description:
          "Projects group documents together. Pin projects to keep them available in the sidebar. Explore projects to browse all of your projects, projects shared with you, and all public projects across DocumentCloud.",
        align: "center",
      },
    },
    {
      element: "#content",
      popover: {
        title: "Search and browse documents",
        description:
          "Documents now load in as you scroll down. You can search by keyword or filters. Select documents to take bulk actions, like editing metadata or running an add-on.",
        side: "left",
        align: "center",
      },
    },
    {
      element: "#action",
      popover: {
        title: "Take action",
        description: "The action sidebar shows you everything you can do.",
        align: "center",
      },
    },
    {
      element: "#add-ons",
      popover: {
        title: "Go further with Add-Ons",
        description:
          "Add-ons provide extended functionality from the DocumentCloud community. Your pinned add-ons will appear here for quick access. Explore add-ons to search and browse by category, and see how much you can get done!",
        align: "center",
      },
    },
  ],
  "/documents/[id]-[slug]": [
    {
      popover: {
        title: "This is the new document viewer",
        description:
          "We've made reading, annotating, and redacting your documents better than ever. Would you like to see what's new?",
        align: "center",
      },
    },
    {
      element: "#navigation",
      popover: {
        title: "Quick links",
        description:
          "See and quickly view this document's projects, metadata, and notes. If you own this document, quickly access editing controls from here, as well.",
        align: "center",
      },
    },
    {
      element: "#content",
      popover: {
        title: "A whole new view",
        description:
          "We now render your PDFs directly in your browser, with improved text-selection and navigation controls. Switch views from the top toolbar.",
        align: "center",
      },
    },
    {
      element: "#actions",
      popover: {
        title: "Take action",
        description:
          "Everything you can do with a document is available here, including sharing and embedding. Your pinned add-ons will show up here, too.",
        align: "center",
      },
    },
  ],
};
