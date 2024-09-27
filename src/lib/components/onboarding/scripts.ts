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
      element: "#content",
      popover: {
        title: "Search and browse documents",
        description:
          "Documents now load in as you scroll down. You can search by keyword or filters.",
        side: "left",
        align: "center",
      },
    },
    {
      element: "#action",
      popover: {
        title: "Take action",
        description: "The action sidebar shows you everything you can do",
        align: "center",
      },
    },
  ],
};
