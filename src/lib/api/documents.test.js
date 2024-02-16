import { describe, test, expect } from "vitest";

import * as documents from "./documents.js";

describe("document fetching", () => {
  test("get a single document", async () => {
    const doc = await documents.get(2622);
  });

  test("search documents", async () => {
    const docs = await documents.search("", true);
  });
});
