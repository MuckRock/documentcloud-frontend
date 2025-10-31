// dedicated, minimal config required for embeds
import * as remote from "./remote.js";
import * as staging from "./staging.js";
import * as production from "./production.js";

let APP_URL = "https://www.dev.documentcloud.org/";
let EMBED_URL = "https://www.dev.documentcloud.org/";

if (process.env.NODE_ENV === "remote") {
  APP_URL = remote.APP_URL;
  EMBED_URL = remote.EMBED_URL;
}

if (process.env.NODE_ENV === "staging") {
  APP_URL = staging.APP_URL;
  EMBED_URL = staging.EMBED_URL;
}

if (process.env.NODE_ENV === "production") {
  APP_URL = production.APP_URL;
  EMBED_URL = production.EMBED_URL;
}

export { APP_URL, EMBED_URL };
