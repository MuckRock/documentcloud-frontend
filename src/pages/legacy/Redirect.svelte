<script>
  import axios from "axios";
  import { onMount } from "svelte";
  import { pushUrl } from "@/router/router.js";
  import { projectUrl, orgUrl, userUrl } from "@/search/search.js";

  import {
    PROJECT_REDIRECT_HASH_URL,
    ORG_REDIRECT_HASH_URL,
  } from "../../config/config.js";

  export let query = null;

  const redirects = [
    {
      regex: /^Project: ?"(.*)" ?$/,
      type: "hash",
      fn: PROJECT_REDIRECT_HASH_URL,
      urlHandler: (id, projectName) => projectUrl({ title: projectName, id }),
    },
    {
      regex: /^Group:(.*) ?$/,
      type: "hash",
      fn: ORG_REDIRECT_HASH_URL,
      urlHandler: (id, orgSlug) => orgUrl({ name: orgSlug, id }),
    },
    {
      regex: /^projectid:([0-9]+)(.*) ?$/,
      type: "simple",
      urlHandler: (id, projectName) => projectUrl({ title: projectName, id }),
    },
    {
      regex: /^Account:([0-9]+)(.*) ?$/,
      type: "simple",
      urlHandler: (id, accountSlug) => userUrl({ name: accountSlug, id }),
    },
  ];

  function hash(d = 0, s) {
    // Adapted from https://github.com/sindresorhus/fnv1a
    s = unescape(encodeURIComponent(s));
    if (d == 0) d = 16777619;

    for (let i = 0; i < s.length; i++) {
      d ^= s.charCodeAt(i);
      d += (d << 1) + (d << 4) + (d << 7) + (d << 8) + (d << 24);
    }

    return d >>> 0;
  }

  function validate(value, key) {
    // Validate that the extra hash checks out for the key
    const validation = value[1];
    if (hash(134871, key) % 256 == validation) return value[0];
    return null;
  }

  function lookup(mph, key) {
    // Lookup a key in the minimal perfect hash (with validation)
    const [G, V, size] = mph;
    const d = G[hash(0, key) % size] || 0;
    if (d < 0) return validate(V[-d - 1], key);
    return validate(V[hash(d, key) % size], key);
  }

  function redirectDefault() {
    pushUrl("/");
  }

  async function getHash(hashFileName) {
    // Download and decode minimal perfect hash structure in binary format
    const { data } = await axios.get(hashFileName, {
      responseType: "arraybuffer",
    });

    // Decode hash structure
    const dataview = new DataView(data);
    let offset = 0;
    const size = dataview.getInt32(offset);
    offset += 4;
    const gMin = dataview.getInt32(offset);
    offset += 4;
    const vMin = dataview.getInt32(offset);
    offset += 4;

    const G = [];
    const V = [];
    for (let i = 0; i < size; i++) {
      G.push(dataview.getUint16(offset) + gMin);
      offset += 2;
      const v = dataview.getUint16(offset) + vMin;
      offset += 2;
      const check = dataview.getUint8(offset);
      offset++;
      V.push([v, check]);
    }
    return [G, V, size];
  }

  onMount(async () => {
    try {
      // Try to reroute based on legacy project url's
      const queryDecoded = decodeURI(query);

      for (let i = 0; i < redirects.length; i++) {
        // Try redirects in order
        const redirect = redirects[i];
        const regexResult = redirect.regex.exec(queryDecoded);
        if (regexResult == null) continue;

        // Redirect based on handler type
        let redirectUrl = null;
        if (redirect.type == "simple") {
          const id = regexResult[1];
          let slug = regexResult[2];

          // Handle id-slug and just id without slug
          if (slug.startsWith("-")) slug = slug.substr(1);

          redirectUrl = redirect.urlHandler(id, slug);
        } else if (redirect.type == "hash") {
          const hash = await getHash(redirect.fn);
          const key = regexResult[1];
          const id = lookup(hash, key);

          // Result not found? Redirect to homepage
          if (id == null) redirectDefault();

          redirectUrl = redirect.urlHandler(id, key);
        }

        if (redirectUrl != null) {
          return pushUrl(decodeURI(redirectUrl));
        } else {
          return redirectDefault();
        }
      }

      redirectDefault();
    } catch (e) {
      // TODO: log
      console.error(e);
      return redirectDefault();
    }
  });
</script>
