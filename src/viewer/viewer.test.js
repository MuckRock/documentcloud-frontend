import { viewer } from "./viewer";

test("ordered sections/notes", () => {
  viewer.sections = [
    {
      page: 1
    }
  ];
  viewer.notes = [];
  expect(viewer.orderedSectionsAndNotes).toEqual([
    {
      type: "section",
      value: {
        page: 1
      }
    }
  ]);
  expect(viewer.sectionsAndNotes).toEqual([
    {
      type: "section",
      section: {
        page: 1
      },
      children: []
    }
  ]);

  viewer.notes = [
    {
      page: 1
    }
  ];
  expect(viewer.orderedSectionsAndNotes).toEqual([
    {
      type: "section",
      value: {
        page: 1
      }
    },
    {
      type: "note",
      value: {
        page: 1
      }
    }
  ]);
  expect(viewer.sectionsAndNotes).toEqual([
    {
      type: "section",
      section: {
        page: 1
      },
      children: [
        {
          type: "note",
          note: {
            page: 1
          }
        }
      ]
    }
  ]);

  viewer.notes = [{ page: 0 }, { page: 2 }, { page: 3 }];
  expect(viewer.orderedSectionsAndNotes).toEqual([
    {
      type: "note",
      value: {
        page: 0
      }
    },
    {
      type: "section",
      value: {
        page: 1
      }
    },
    {
      type: "note",
      value: {
        page: 2
      }
    },
    {
      type: "note",
      value: {
        page: 3
      }
    }
  ]);
  expect(viewer.sectionsAndNotes).toEqual([
    {
      type: "note",
      note: {
        page: 0
      }
    },
    {
      type: "section",
      section: {
        page: 1
      },
      children: [
        {
          type: "note",
          note: {
            page: 2
          }
        },
        {
          type: "note",
          note: {
            page: 3
          }
        }
      ]
    }
  ]);

  viewer.sections = [{ page: 1 }, { page: 3 }, { page: 5 }, { page: 100 }];
  expect(viewer.orderedSectionsAndNotes).toEqual([
    {
      type: "note",
      value: {
        page: 0
      }
    },
    {
      type: "section",
      value: {
        page: 1
      }
    },
    {
      type: "note",
      value: {
        page: 2
      }
    },
    {
      type: "section",
      value: {
        page: 3
      }
    },
    {
      type: "note",
      value: {
        page: 3
      }
    },
    {
      type: "section",
      value: {
        page: 5
      }
    },
    {
      type: "section",
      value: {
        page: 100
      }
    }
  ]);
  expect(viewer.sectionsAndNotes).toEqual([
    {
      type: "note",
      note: {
        page: 0
      }
    },
    {
      type: "section",
      section: {
        page: 1
      },
      children: [
        {
          type: "note",
          note: {
            page: 2
          }
        }
      ]
    },
    {
      type: "section",
      section: {
        page: 3
      },
      children: [
        {
          type: "note",
          note: {
            page: 3
          }
        }
      ]
    },
    {
      type: "section",
      section: {
        page: 5
      },
      children: []
    },
    {
      type: "section",
      section: {
        page: 100
      },
      children: []
    }
  ]);

  viewer.notes = [];
  expect(viewer.orderedSectionsAndNotes).toEqual([
    {
      type: "section",
      value: {
        page: 1
      }
    },
    {
      type: "section",
      value: {
        page: 3
      }
    },
    {
      type: "section",
      value: {
        page: 5
      }
    },
    {
      type: "section",
      value: {
        page: 100
      }
    }
  ]);
  expect(viewer.sectionsAndNotes).toEqual([
    {
      type: "section",
      section: {
        page: 1
      },
      children: []
    },
    {
      type: "section",
      section: {
        page: 3
      },
      children: []
    },
    {
      type: "section",
      section: {
        page: 5
      },
      children: []
    },
    {
      type: "section",
      section: {
        page: 100
      },
      children: []
    }
  ]);

  viewer.sections = [];
  expect(viewer.orderedSectionsAndNotes).toEqual([]);
  expect(viewer.sectionsAndNotes).toEqual([]);
});
