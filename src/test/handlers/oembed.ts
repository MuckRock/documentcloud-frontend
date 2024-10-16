import { rest } from "msw";

import oembedFixture from "../fixtures/oembed.json";
import { createApiUrl, dataHandler } from "./utils";

export const oembed = rest.get(
  createApiUrl("oembed/"),
  dataHandler(oembedFixture),
);
