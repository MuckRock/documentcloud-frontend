import { http } from "msw";

import oembedFixture from "../fixtures/oembed.json";
import { createApiUrl, dataHandler } from "./utils";

export const oembed = http.get(
  createApiUrl("oembed/"),
  dataHandler(oembedFixture),
);
